import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

// Helper: 125 -> "02:05"
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
}

export default function VideoPlayer({ videoId, lessonId, lessonTitle }) {
  const { user } = useAuth()
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  
  // Timers
  const saveIntervalRef = useRef(null)
  const progressIntervalRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  // State
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Double tap state
  const lastTapRef = useRef({ time: 0, x: 0 })

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
      setDuration(event.target.getDuration() || 0)
      setIsReady(true)

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
          setCurrentTime(data.last_pos_seconds)
        }
      }
    }

    const onPlayerStateChange = (event) => {
      if (!playerRef.current) return
      
      const state = event.data
      setIsPlaying(state === 1) // 1 = playing
      
      if (state === 1) {
        startTrackingProgress()
        startSavingProgress()
        hideControlsAfterDelay()
      } else {
        stopTrackingProgress()
        stopSavingProgress()
        setShowControls(true) // Show controls when paused
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

    if (window.YT && window.YT.Player) {
      new window.YT.Player(`yt-${videoId}`, {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      })
    }

    return () => {
      stopTrackingProgress()
      stopSavingProgress()
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [videoId, lessonId, user?.id])

  // Track progress locally (for slider UI)
  const startTrackingProgress = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime() || 0)
        setDuration(playerRef.current.getDuration() || 0)
      }
    }, 500)
  }

  const stopTrackingProgress = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
  }

  // Save progress to Supabase
  const startSavingProgress = () => {
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
  }

  const stopSavingProgress = () => {
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current)
    saveIntervalRef.current = null
  }

  // UI Handlers
  const togglePlay = (e) => {
    if (e) e.stopPropagation()
    if (!playerRef.current) return
    if (isPlaying) playerRef.current.pauseVideo()
    else playerRef.current.playVideo()
  }

  const toggleMute = (e) => {
    if (e) e.stopPropagation()
    if (!playerRef.current) return
    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }

  const handleSeek = (e) => {
    if (e) e.stopPropagation()
    const val = parseFloat(e.target.value)
    setCurrentTime(val)
    if (playerRef.current) {
      playerRef.current.seekTo(val, true)
    }
  }

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation()
    setIsFullscreen(!isFullscreen)
  }

  // Interactivity: hover / tap -> show controls
  const handleInteraction = (e) => {
    setShowControls(true)
    if (isPlaying) {
      hideControlsAfterDelay()
    }
    
    // Double tap logic for seeking
    if (e.type === 'touchstart' || e.type === 'click') {
      let clientX = e.clientX
      if (e.type === 'touchstart') {
          clientX = e.touches[0].clientX
      }
      const now = Date.now()
      const timeDiff = now - lastTapRef.current.time
      const posDiff = Math.abs(clientX - lastTapRef.current.x)

      if (timeDiff < 400 && posDiff < 50) {
        // Double tap confirmed
        const rect = containerRef.current.getBoundingClientRect()
        const clickXObj = clientX - rect.left
        
        if (clickXObj > rect.width / 2) {
          // Right side -> Forward 10s
          if (playerRef.current) {
            const newT = Math.min(duration, currentTime + 10)
            playerRef.current.seekTo(newT, true)
            setCurrentTime(newT)
            toast.success("10s oldinga")
          }
        } else {
          // Left side -> Backward 10s
          if (playerRef.current) {
            const newT = Math.max(0, currentTime - 10)
            playerRef.current.seekTo(newT, true)
            setCurrentTime(newT)
            toast.success("10s orqaga")
          }
        }
        lastTapRef.current = { time: 0, x: 0 } // reset
        return
      }
      
      lastTapRef.current = { time: now, x: clientX }
    }
  }

  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      className={isFullscreen ? 'bma-fullscreen' : ''}
      style={{ 
        width: '100%', 
        aspectRatio: isFullscreen ? 'auto' : '16/9', 
        borderRadius: isFullscreen ? 0 : 'var(--radius-card)', 
        overflow: 'hidden',
        background: '#000',
        border: '1px solid var(--border-soft)',
        boxShadow: 'var(--shadow-elevated)',
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 1
      }}
    >
      {/* 
        YT iframe with NO controls, NO info, NO keyboard.
        Must use pointer-events: none so clicks land on our overlay.
      */}
      <iframe 
        id={`yt-${videoId}`}
        style={{ width: '100%', height: '100%', border: 'none', pointerEvents: isReady ? 'none' : 'auto' }}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />

      {/* Loading */}
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 10 }}>
          <div style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3461FF', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Obscure YouTube Pause Overlays (blur the underlying iframe when paused) */}
      {!isPlaying && isReady && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 12, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', transition: 'all 0.3s ease' }} />
      )}

      {/* Overlay Click Area (Play/Pause center trigger) */}
      {isReady && (
        <div 
          onClick={() => {
            // Only toggle play if it's not a double-tap
            setTimeout(() => {
              if (lastTapRef.current.time > 0) togglePlay()
            }, 300)
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 15, cursor: 'pointer' }}
        />
      )}

      {/* Controls UI */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'opacity 0.4s ease',
        opacity: (showControls || !isPlaying) ? 1 : 0,
        background: (showControls || !isPlaying) ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 100%)' : 'none'
      }}>
        
        {/* Top Header (Channel Avatar & Title) */}
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'flex-start', gap: 16, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', opacity: (showControls || !isPlaying) ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', flexShrink: 0, padding: 4 }}>
            <img src="/logo.svg" alt="BMA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, paddingRight: 40 }}>
            <h3 className="outfit-font" style={{ color: '#FFFFFF', margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.6)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {lessonTitle || "Bobur Mentor Academy"}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.8125rem', fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
              Bobur Mentor Academy
            </p>
          </div>
        </div>

        {/* Center Play Icon (optional visual feedback) */}
        {!isPlaying && showControls && isReady && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 64, height: 64, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={32} fill="white" color="white" style={{ marginLeft: 4 }} />
          </div>
        )}

        {/* Bottom Control Bar */}
        <div style={{ padding: '16px 20px', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          {/* Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              style={{
                flex: 1, height: 4, borderRadius: 2, appearance: 'none', outline: 'none', cursor: 'pointer',
                background: `linear-gradient(to right, #3461FF ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%)`
              }}
              className="custom-seek-bar"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={togglePlay} style={btnStyle}>
                {isPlaying ? <Pause size={20} fill="white" color="white" /> : <Play size={20} fill="white" color="white" />}
              </button>
              
              <button onClick={toggleMute} style={btnStyle}>
                {isMuted ? <VolumeX size={20} color="white" /> : <Volume2 size={20} color="white" />}
              </button>

              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                {formatTime(currentTime)} <span style={{ color: 'rgba(255,255,255,0.5)' }}>/ {formatTime(duration)}</span>
              </span>
            </div>

            {/* Right Controls */}
            <button onClick={toggleFullscreen} style={btnStyle}>
              {isFullscreen ? <Minimize size={20} color="white" /> : <Maximize size={20} color="white" />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .bma-fullscreen {
          position: fixed !important;
          top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
          width: 100vw !important; height: 100vh !important;
          z-index: 99999 !important;
          border-radius: 0 !important;
        }
        .custom-seek-bar::-webkit-slider-thumb {
          appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #3461FF; cursor: pointer; transition: transform 0.2s;
        }
        .custom-seek-bar::-webkit-slider-thumb:hover { transform: scale(1.3); }
      `}</style>
    </div>
  )
}

const btnStyle = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  opacity: 0.9, transition: 'opacity 0.2s'
}
