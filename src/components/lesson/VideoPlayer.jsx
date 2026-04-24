import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Maximize, Play, Pause, Volume2, VolumeX } from 'lucide-react'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export default function VideoPlayer({ videoId, lessonId, onVideoEnd }) {
  const { user } = useAuth()
  const playerRef = useRef(null)
  const containerRef = useRef(null)

  const saveIntervalRef = useRef(null)
  const progressIntervalRef = useRef(null)

  const [isReady, setIsReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isSeeking, setIsSeeking] = useState(false)
  const isSeekingRef = useRef(false)
  
  const setIsSeekingSafe = useCallback((val) => {
    setIsSeeking(val)
    isSeekingRef.current = val
  }, [])
  
  const pendingSeekTimeRef = useRef(null)
  const hideControlsTimeoutRef = useRef(null)

  useEffect(() => {
    if (isFullscreen) document.body.classList.add('hide-ui-for-video')
    else document.body.classList.remove('hide-ui-for-video')
    return () => document.body.classList.remove('hide-ui-for-video')
  }, [isFullscreen])

  const wakeControls = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current)
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isSeeking) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying, isSeeking])

  useEffect(() => {
    if (!isPlaying || isSeeking) {
      setShowControls(true)
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current)
    } else {
      wakeControls()
    }
  }, [isPlaying, isSeeking, wakeControls])

  const startTrackingProgress = useCallback(() => {
    if (progressIntervalRef.current) return
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const currentDur = playerRef.current.getDuration() || 0
        if (currentDur > 0) setDuration(currentDur)
        
        if (!isSeekingRef.current) {
          const actualTime = playerRef.current.getCurrentTime() || 0
          if (pendingSeekTimeRef.current !== null) {
            if (Math.abs(actualTime - pendingSeekTimeRef.current) <= 2) {
               pendingSeekTimeRef.current = null
               setCurrentTime(actualTime)
            }
          } else {
            setCurrentTime(actualTime)
          }
        }
      }
    }, 250)
  }, [])

  const stopTrackingProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

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

      event.target.setVolume(100)

      if (user && lessonId) {
        const { data } = await supabase.from('lesson_progress').select('last_pos_seconds').eq('user_id', user.id).eq('lesson_id', lessonId).maybeSingle()
        if (data?.last_pos_seconds > 0) {
          event.target.seekTo(data.last_pos_seconds, true)
          setTimeout(() => setCurrentTime(data.last_pos_seconds), 200)
        }
      }
    }

    const onPlayerStateChange = (event) => {
      const state = event.data
      if (state === 1) { // Playing
        setIsPlaying(true)
        startSavingProgress()
        startTrackingProgress()
      } else if (state === 0) { // Ended
        setIsPlaying(false)
        stopSavingProgress()
        stopTrackingProgress()
        if (onVideoEnd) onVideoEnd()
      } else { 
        setIsPlaying(false)
        stopSavingProgress()
        stopTrackingProgress()
        if (playerRef.current) {
          const dur = playerRef.current.getDuration()
          if (dur > 0) setDuration(dur)
        }
      }
    }

    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy() } catch(e) {}
      }

      new window.YT.Player(`yt-player-${videoId}`, {
        videoId: videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          iv_load_policy: 3,
          origin: window.location.origin
        },
        events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
      })
    }

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady()
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    return () => {
      stopSavingProgress()
      stopTrackingProgress()
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [videoId, user, lessonId, startSavingProgress, stopSavingProgress, startTrackingProgress, stopTrackingProgress, onVideoEnd])

  const togglePlay = (e) => {
    if (e) e.stopPropagation()
    if (!playerRef.current) return
    if (isPlaying) playerRef.current.pauseVideo()
    else playerRef.current.playVideo()
  }

  const handleVideoAreaClick = () => {
    setShowControls(prev => !prev)
    if (!showControls) wakeControls()
  }

  // --- NATIVE RANGE SEEKING ---
  const handleSeekChange = (e) => {
    e.stopPropagation()
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
  }

  const handleSeekMouseDown = (e) => {
    e.stopPropagation()
    setIsSeekingSafe(true)
    if (playerRef.current && isPlaying) playerRef.current.pauseVideo()
  }

  const handleSeekMouseUp = (e) => {
    e.stopPropagation()
    setIsSeekingSafe(false)
    if (playerRef.current) {
      const newTime = parseFloat(e.target.value)
      playerRef.current.seekTo(newTime, true)
      pendingSeekTimeRef.current = newTime
      playerRef.current.playVideo()
    }
  }

  const toggleFullscreen = async (e) => {
    if (e) e.stopPropagation()
    if (!isFullscreen) {
      const el = containerRef.current
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen()
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen()
        } else {
          setIsFullscreen(true)
        }
      } catch (err) {
        // Fallback for Telegram Mini Apps or restricted browsers
        setIsFullscreen(true)
      }
    } else {
      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen()
        } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
          document.webkitExitFullscreen()
        } else {
          setIsFullscreen(false)
        }
      } catch (err) {
        setIsFullscreen(false)
      }
      setIsFullscreen(false) // Ensure state resets on fallback
    }
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    if (!playerRef.current) return
    if (isMuted) {
      setIsMuted(false)
      playerRef.current.unMute()
      if (volume === 0) {
        setVolume(100)
        playerRef.current.setVolume(100)
      } else {
        playerRef.current.setVolume(volume)
      }
    } else {
      setIsMuted(true)
      playerRef.current.mute()
    }
  }

  const handleVolumeChange = (e) => {
    e.stopPropagation()
    const vol = parseInt(e.target.value, 10)
    setVolume(vol)
    if (playerRef.current) {
      playerRef.current.setVolume(vol)
      if (vol === 0) {
        setIsMuted(true)
        playerRef.current.mute()
      } else {
        setIsMuted(false)
        playerRef.current.unMute()
      }
    }
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div 
      ref={containerRef}
      onMouseMove={wakeControls}
      onClick={handleVideoAreaClick}
      style={{
        ...(isFullscreen ? {
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999, width: '100vw', height: '100dvh',
          aspectRatio: 'auto'
        } : {
          position: 'relative', width: '100%',
          aspectRatio: '16/9', height: 'auto'
        }),
        background: '#000', overflow: 'hidden',
        userSelect: 'none', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <style>{`
        .vp-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          transition: height 0.2s;
        }
        .vp-slider:hover, .vp-slider:active {
          height: 8px;
        }
        .vp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          transition: transform 0.1s;
        }
        .vp-slider:hover::-webkit-slider-thumb, .vp-slider:active::-webkit-slider-thumb {
          transform: scale(1.2);
          background: #3461FF;
        }
        @media (max-width: 600px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>

      {/* THE IFRAME WRAPPER: Original size, no scaling */}
      <div style={{ position: 'absolute', inset: 0, opacity: isReady ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%' }}>
          <div id={`yt-player-${videoId}`} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>

      {/* Loading Spinner */}
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3461FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* MAIN UI OVERLAY (Fade in/out based on showControls) */}
      <div 
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          opacity: showControls || !isPlaying ? 1 : 0,
          transition: 'opacity 0.3s ease',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}
      >
        {/* PHYSICAL BLUR COVERS TO HIDE ANY YT ELEMENTS (Only visible when controls are visible) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ padding: '20px', zIndex: 1 }}></div> {/* Spacer for top */}

        {/* Center Play/Pause Button */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <button 
            onClick={togglePlay}
            style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', pointerEvents: showControls ? 'auto' : 'none', transform: isPlaying ? 'scale(0.95)' : 'scale(1)', opacity: showControls && !isPlaying ? 1 : 0, transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <Play size={32} fill="currentColor" style={{ marginLeft: 4 }} />
          </button>
        </div>

        {/* Bottom Control Bar */}
        <div style={{ padding: '0 20px 20px', pointerEvents: showControls ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 1 }}>
          
          {/* Progress Bar Area - Native Range Input */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}>
             <input 
               type="range"
               min="0"
               max={duration || 100}
               value={currentTime}
               onChange={handleSeekChange}
               onMouseDown={handleSeekMouseDown}
               onMouseUp={handleSeekMouseUp}
               onTouchStart={handleSeekMouseDown}
               onTouchEnd={handleSeekMouseUp}
               onClick={(e) => e.stopPropagation()}
               className="vp-slider"
               style={{
                 background: `linear-gradient(to right, #3461FF 0%, #3461FF ${progressPct}%, rgba(255,255,255,0.2) ${progressPct}%, rgba(255,255,255,0.2) 100%)`
               }}
             />
          </div>

          {/* Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#E2E8F0', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'monospace' }}>
                <span>{formatTime(currentTime)}</span>
                <span style={{ opacity: 0.5 }}>/</span>
                <span style={{ opacity: 0.8 }}>{formatTime(duration)}</span>
              </div>

              {/* Volume Control - Hidden on mobile */}
              <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input 
                  type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange} onClick={(e) => e.stopPropagation()}
                  style={{ width: 60, accentColor: '#3461FF', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
                <Maximize size={20} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
