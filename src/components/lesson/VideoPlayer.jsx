import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { Maximize, Play, Pause, X, RotateCcw, RotateCw } from 'lucide-react'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export default function VideoPlayer({ videoId, lessonId }) {
  const { user } = useAuth()
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const trackRef = useRef(null)

  const saveIntervalRef = useRef(null)
  const progressIntervalRef = useRef(null)

  const [isReady, setIsReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Drag & Hover State
  // Drag & Hover State
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false) // Fix for stale closure in setInterval
  const [hoverPosition, setHoverPosition] = useState(null)

  const setIsDraggingSafe = useCallback((val) => {
    setIsDragging(val)
    isDraggingRef.current = val
  }, [])

  // Manage body class for hiding bottom nav in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('hide-ui-for-video')
    } else {
      document.body.classList.remove('hide-ui-for-video')
    }
    return () => document.body.classList.remove('hide-ui-for-video')
  }, [isFullscreen])

  // Progress Tracking UI
  // Defining them up here so we can use them anywhere without stale issues!
  const startTrackingProgress = useCallback(() => {
    if (progressIntervalRef.current) return
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        // ALWAYS keep duration updated (fixes getDuration returning 0 on initial load)
        const currentDur = playerRef.current.getDuration()
        if (currentDur && currentDur > 0) {
          setDuration(currentDur)
        }
        
        // ONLY update currentTime from video if the user is NOT dragging the bar
        if (!isDraggingRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime())
        }
      }
    }, 150) // Fast 150ms update for smooth UI
  }, [])

  const stopTrackingProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  // Save progress to Supabase (Every 10s)
  const startSavingProgress = useCallback(() => {
    if (saveIntervalRef.current) return
    saveIntervalRef.current = setInterval(async () => {
      if (playerRef.current && user && lessonId) {
        const ct = Math.floor(playerRef.current.getCurrentTime() || 0)
        const dur = playerRef.current.getDuration() || 0
        const isCompleted = dur > 0 && ct > (dur * 0.9)

        await supabase.rpc('upsert_lesson_progress', {
          p_lesson_id: lessonId,
          p_pos_seconds: ct,
          p_is_completed: isCompleted
        })
      }
    }, 10000)
  }, [user, lessonId])

  const stopSavingProgress = useCallback(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current)
      saveIntervalRef.current = null
    }
  }, [])

  // 1. YT IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = "https://www.youtube.com/iframe_api"
      const firstTag = document.getElementsByTagName('script')[0]
      firstTag.parentNode.insertBefore(tag, firstTag)
    }

    const onPlayerReady = async (event) => {
      playerRef.current = event.target
      setIsReady(true)
      
      const dur = event.target.getDuration()
      if (dur > 0) setDuration(dur)

      // Fetch last progress
      if (user && lessonId) {
        const { data } = await supabase
          .from('lesson_progress')
          .select('last_pos_seconds')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle()

        if (data?.last_pos_seconds > 0) {
          event.target.seekTo(data.last_pos_seconds, true)
          // Wait for seek to complete before updating visually
          setTimeout(() => setCurrentTime(data.last_pos_seconds), 200)
          toast.info("Davom ettirilmoqda...", {
            description: `Darsni qolgan joyidan davom ettiryapsiz.`,
            duration: 2000
          })
        }
      }
    }

    const onPlayerStateChange = (event) => {
      const state = event.data
      
      if (state === 1) { // Playing
        setIsPlaying(true)
        startSavingProgress()
        startTrackingProgress()
      } else { // Paused, Ended, Buffering, Unstarted
        setIsPlaying(false)
        stopSavingProgress()
        stopTrackingProgress()
        
        // Ensure duration updates even on initial buffer
        if (playerRef.current) {
          const dur = playerRef.current.getDuration()
          if (dur > 0) setDuration(dur)
        }
      }
    }

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player(`yt-${videoId}`, {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      })
    }

    // Fallback if API was already loaded
    if (window.YT && window.YT.Player && !playerRef.current) {
      new window.YT.Player(`yt-${videoId}`, {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      })
    }

    return () => {
      stopSavingProgress()
      stopTrackingProgress()
    }
  }, [videoId, lessonId, user, startSavingProgress, stopSavingProgress, startTrackingProgress, stopTrackingProgress])

  // Player Handlers
  const togglePlay = () => {
    if (!playerRef.current || !isReady) return
    if (isPlaying) playerRef.current.pauseVideo()
    else playerRef.current.playVideo()
  }

  const skipTime = (amount, e) => {
    if (e) e.stopPropagation()
    if (!playerRef.current || !duration) return
    const newTime = Math.min(Math.max(currentTime + amount, 0), duration)
    playerRef.current.seekTo(newTime, true)
    setCurrentTime(newTime)
  }

  // --- Advanced Drag & Seek Logic ---
  const scrubTimeRef = useRef(0)

  const updateProgressFromEvent = useCallback((clientX, applySeek = false) => {
    if (!trackRef.current || !duration || !playerRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    let x = clientX - rect.left
    if (x < 0) x = 0
    if (x > rect.width) x = rect.width
    const percent = x / rect.width
    const newTime = percent * duration
    
    scrubTimeRef.current = newTime
    setCurrentTime(newTime) // Visually update immediately
    
    if (applySeek) {
      playerRef.current.seekTo(newTime, true) // Tell YT player to scrub
    }
  }, [duration])

  const handlePointerDown = (e) => {
    // Only intercept left clicks or touch starts
    if (e.button !== undefined && e.button !== 0) return
    setIsDraggingSafe(true)
    // Seek instantly on exact tap/click
    updateProgressFromEvent(e.clientX || (e.touches && e.touches[0].clientX), true)
  }

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (isDragging) {
        // Prevent default to disable scrolling while scrubbing on mobile
        if (e.cancelable) e.preventDefault() 
        const clientX = e.clientX || (e.touches && e.touches[0].clientX)
        updateProgressFromEvent(clientX, false) // Only visual update -> NO Youtube API choking
      }
    }
    const handlePointerUp = () => {
      if (isDragging) {
        setIsDraggingSafe(false)
        setHoverPosition(null)
        // Crucial: Exact final seek applied here when dragging ends!
        if (playerRef.current) {
          playerRef.current.seekTo(scrubTimeRef.current, true)
        }
      }
    }

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('touchmove', handlePointerMove, { passive: false })
      window.addEventListener('touchend', handlePointerUp)
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDragging, updateProgressFromEvent, setIsDraggingSafe])

  const handleMouseMoveTrack = (e) => {
    if (isDragging || !trackRef.current || !duration) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(x / rect.width, 1))
    setHoverPosition({ x, time: percent * duration })
  }

  const handleMouseLeaveTrack = () => {
    if (!isDragging) setHoverPosition(null)
  }

  // UI calculations
  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>

      {/* VIDEO CONTAINER */}
      <div
        ref={containerRef}
        className={isFullscreen ? 'bma-fullscreen' : ''}
        style={{
          width: '100%',
          aspectRatio: isFullscreen ? 'auto' : '16/9',
          borderRadius: isFullscreen ? 0 : 'var(--radius-card)',
          overflow: 'hidden',
          background: '#0F172A',
          border: 'none',
          boxShadow: isFullscreen ? 'none' : 'var(--shadow-elevated)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          position: 'relative',
          zIndex: isFullscreen ? 99999 : 1
        }}
      >
        <iframe
          id={`yt-${videoId}`}
          style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&controls=0&fs=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />

        {/* SECURE SHIELD (Play/Pause Area) */}
        <div
          onClick={togglePlay}
          onContextMenu={(e) => { e.preventDefault(); return false; }}
          style={{
            position: 'absolute', inset: 0, zIndex: 10, cursor: 'pointer',
            background: !isPlaying && isReady ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
            transition: 'background 0.4s ease'
          }}
        >
          {/* PREMIUM CENTER PLAY BUTTON */}
          {!isPlaying && isReady && (
            <div className="premium-play-bubble" style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              color: 'white', transition: 'transform 0.2s',
            }}>
              <Play className="play-icon" fill="white" strokeWidth={0} style={{ marginLeft: '4px' }} />
            </div>
          )}
        </div>

        {/* CUSTOM MINIMALIST CONTROL BAR */}
        <div
          style={{
            position: 'absolute', zIndex: 20,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(20px) saturate(1.5)', WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex', flexDirection: 'column',
            opacity: isPlaying && !isDragging ? 0 : 1,
            transform: isPlaying && !isDragging ? 'translateY(10px)' : 'translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: isPlaying && !isDragging ? 'none' : 'auto'
          }}
          className="custom-controls"
        >
          {/* Scrubbing Tooltip */}
          {hoverPosition && (
            <div className="tooltip-mobile-hide" style={{
              position: 'absolute', top: -38, left: hoverPosition.x + 16,
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.95)', color: 'white',
              fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px',
              borderRadius: 6, pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em',
              zIndex: 30
            }}>
              {formatTime(hoverPosition.time)}
            </div>
          )}

          {/* Interactive Progress Bar */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onMouseMove={handleMouseMoveTrack}
            onMouseLeave={handleMouseLeaveTrack}
            // Touch handlers mapped directly for robustness
            onTouchStart={handlePointerDown}
            className="progress-container"
            style={{
              width: '100%', height: 24, // Expanded hit area
              display: 'flex', alignItems: 'center',
              cursor: 'pointer', position: 'relative', touchAction: 'none'
            }}
          >
            {/* Visual Track */}
            <div className="progress-visual-track" style={{
              width: '100%', height: 5, background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 4, position: 'relative', transition: 'height 0.2s', overflow: 'hidden'
            }}>
              {/* Play Progress */}
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progressPercent}%`,
                background: isDragging ? '#60A5FA' : '#3461FF',
                borderRadius: 4, transition: isDragging ? 'none' : 'width 0.1s linear'
              }} />
            </div>

            {/* Playhead thumb (visible on hover/drag) */}
            <div className="progress-thumb" style={{
              position: 'absolute', left: `${progressPercent}%`, top: '50%',
              width: 14, height: 14, borderRadius: '50%', background: 'white',
              transform: 'translate(-50%, -50%) scale(0)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)', transition: 'transform 0.2s',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="controls-action-bar" style={{ display: 'flex', alignItems: 'center' }}>
              {/* Play/Pause Button */}
              <button onClick={togglePlay} className="control-btn play-pause-btn" style={{ color: 'white', borderRadius: 8 }}>
                {isPlaying ? <Pause className="btn-icon" fill="currentColor" strokeWidth={0} /> : <Play className="btn-icon" fill="currentColor" strokeWidth={0} />}
              </button>

              {/* Fast Rewind / Forward (The "Best New Features") */}
              <div className="skip-btns" style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                <button onClick={() => skipTime(-10)} className="control-btn" title="Orqaga 10 soniya" style={{ color: 'white', borderRadius: 8 }}>
                  <RotateCcw className="btn-icon-small" strokeWidth={2.5} />
                </button>
                <button onClick={() => skipTime(10)} className="control-btn" title="Oldinga 10 soniya" style={{ color: 'white', borderRadius: 8 }}>
                  <RotateCw className="btn-icon-small" strokeWidth={2.5} />
                </button>
              </div>

              {/* Minimal Time indicator */}
              <div className="time-indicator" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(currentTime)} <span style={{ opacity: 0.4, margin: '0 2px' }}>/</span> {formatTime(duration)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="control-btn"
                style={{ color: 'white', opacity: 0.8, borderRadius: 8 }}
              >
                {isFullscreen ? <X className="btn-icon-small" strokeWidth={2.5} /> : <Maximize className="btn-icon-small" strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        /* Premium Buffering Spinner */
        .premium-buffering-spinner {
          width: 56px; 
          height: 56px;
          border: 4px solid rgba(255, 255, 255, 0.15);
          border-top-color: #3B82F6; /* Brand BMA Blue */
          border-right-color: transparent;
          border-radius: 50%;
          animation: bma-spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        
        @keyframes bma-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        /* Default Scoped Variables for Web (Desktop) */
        .premium-play-bubble { width: 76px; height: 76px; }
        .play-icon { width: 34px; height: 34px; }
        .custom-controls { bottom: 12px; left: 12px; right: 12px; border-radius: 16px; padding: 10px 16px; gap: 6px; }
        .controls-action-bar { gap: 14px; }
        .skip-btns { gap: 8px; }
        .control-btn { padding: 4px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s, opacity 0.2s, transform 0.1s; background: transparent; }
        .btn-icon { width: 20px; height: 20px; }
        .btn-icon-small { width: 16px; height: 16px; }
        .time-indicator { font-size: 0.75rem; margin-left: 8px; }
        
        .bma-fullscreen {
          position: fixed !important;
          top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
          width: 100vw !important; height: 100vh !important;
          z-index: 99999 !important;
        }

        @media (max-width: 768px) {
          .bma-fullscreen {
            top: 50% !important; left: 50% !important;
            width: 100vh !important; height: 100vw !important;
            transform: translate(-50%, -50%) rotate(90deg) !important;
          }
        }

        /* 📱 RESPONSIVE RULES FOR MOBILE PHONES */
        @media (max-width: 480px) {
          /* Center play button made smaller and shifted slightly UP to prevent overlap */
          .premium-play-bubble { width: 52px !important; height: 52px !important; top: 44% !important; }
          .play-icon { width: 22px !important; height: 22px !important; margin-left: 2px !important; }
          
          /* Bottom controls are flattened to the edge to give maximum breathing room */
          .custom-controls { bottom: 0px !important; left: 0px !important; right: 0px !important; border-radius: 0 0 var(--radius-card) var(--radius-card) !important; padding: 6px 10px !important; gap: 2px !important; }
          .bma-fullscreen .custom-controls { border-radius: 0px !important; }
          
          .controls-action-bar { gap: 4px !important; }
          .skip-btns { gap: 4px !important; }
          .control-btn { padding: 6px !important; } 
          .btn-icon { width: 18px !important; height: 18px !important; }
          .btn-icon-small { width: 16px !important; height: 16px !important; }
          .time-indicator { font-size: 0.65rem !important; margin-left: 4px !important; line-height: 1 !important; display: flex; align-items: center; }
          .tooltip-mobile-hide { display: none !important; } 
        }

        body.hide-ui-for-video .mobile-bottom-nav,
        body.hide-ui-for-video .auth-desktop-sidebar {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        div[style*="aspect-ratio"]:hover .custom-controls,
        .bma-fullscreen:hover .custom-controls {
          opacity: 1 !important;
          transform: translateY(0) !important;
          pointer-events: auto !important;
        }

        /* ONLY APPLY HOVER EFFECTS ON DEVICES WITH A MOUSE */
        @media (hover: hover) {
          .control-btn:hover {
            background: rgba(255,255,255,0.15);
            opacity: 1 !important;
          }
          .progress-container:hover .progress-visual-track {
            height: 7px !important;
          }
          .progress-container:hover .progress-thumb {
            transform: translate(-50%, -50%) scale(1) !important;
          }
          .premium-play-bubble:hover {
            transform: translate(-50%, -50%) scale(1.03) !important;
            background: rgba(255, 255, 255, 0.16) !important;
          }
        }

        /* 👆 Touch logic: active state gives immediate visible feedback and releases clean */
        .control-btn:active {
          background: rgba(255,255,255,0.25) !important;
          transform: scale(0.9) !important;
        }

        .custom-controls:has(.progress-container:active) .progress-thumb {
          transform: translate(-50%, -50%) scale(1.1) !important;
          background: #60A5FA !important;
        }

        .premium-play-bubble:active {
          transform: translate(-50%, -50%) scale(0.95) !important;
        }
      `}</style>
    </div>
  )
}
