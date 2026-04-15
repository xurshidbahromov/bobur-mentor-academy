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
        border: '1px solid var(--border-soft)',
        boxShadow: 'var(--shadow-elevated)',
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
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
            position: 'absolute', top: 12, right: 12, zIndex: 20,
            background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: 'pointer', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            transition: 'all 0.2s'
          }}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .bma-fullscreen {
          position: fixed !important;
          top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
          width: 100vw !important; height: 100vh !important;
          z-index: 99999 !important;
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  )
}
