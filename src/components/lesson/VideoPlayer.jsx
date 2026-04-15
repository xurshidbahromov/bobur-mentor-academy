import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { Maximize, Minimize } from 'lucide-react'

export default function VideoPlayer({ videoId, lessonId }) {
  const { user } = useAuth()
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const saveIntervalRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Manage body class for hiding bottom nav
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('hide-ui-for-video')
    } else {
      document.body.classList.remove('hide-ui-for-video')
    }
    return () => document.body.classList.remove('hide-ui-for-video')
  }, [isFullscreen])

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
          toast.info("Davom ettirilmoqda...", {
            description: `Darsni qolgan joyidan davom ettiryapsiz.`,
            duration: 2000
          })
        }
      }
    }

    const onPlayerStateChange = (event) => {
      // 1 = playing
      if (event.data === 1) {
        startSavingProgress()
      } else {
        stopSavingProgress()
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
      stopSavingProgress()
    }
  }, [videoId, lessonId, user?.id])

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
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current)
      saveIntervalRef.current = null
    }
  }

  return (
    <div 
      ref={containerRef}
      className={isFullscreen ? 'bma-fullscreen' : ''}
      style={{ 
        width: '100%', 
        aspectRatio: isFullscreen ? 'auto' : '16/9', 
        borderRadius: isFullscreen ? 0 : 'var(--radius-card)', 
        overflow: 'hidden',
        background: '#000',
        border: 'none',
        boxShadow: isFullscreen ? 'none' : 'var(--shadow-elevated)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        zIndex: isFullscreen ? 99999 : 1
      }}
    >
      <iframe 
        id={`yt-${videoId}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&controls=1&fs=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
      />

      {/* Loading */}
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 10 }}>
          <div style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3461FF', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Custom Fullscreen Toggle for TMA iOS constraints */}
      {isReady && (
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          title="Katta ekran"
          style={{
            position: 'absolute', bottom: 12, right: 16, zIndex: 20,
            background: '#3461FF', border: '2px solid rgba(255,255,255,0.8)', 
            borderRadius: 8, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(52, 97, 255, 0.4)',
            transition: 'all 0.2s', width: 36, height: 36
          }}
        >
          {isFullscreen ? <Minimize size={20} strokeWidth={2.5} /> : <Maximize size={20} strokeWidth={2.5} />}
        </button>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
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

        body.hide-ui-for-video .mobile-bottom-nav,
        body.hide-ui-for-video .auth-desktop-sidebar {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  )
}
