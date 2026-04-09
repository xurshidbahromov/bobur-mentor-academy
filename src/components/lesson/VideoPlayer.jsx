import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'

export default function VideoPlayer({ videoId, lessonId }) {
  const { user } = useAuth()
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const saveIntervalRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  // 1. Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    const onPlayerReady = async (event) => {
      playerRef.current = event.target
      setIsReady(true)

      // 2. Fetch last progress and seek
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
      createPlayer()
    }

    const createPlayer = () => {
      new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'modestbranding': 1,
          'rel': 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      })
    }

    if (window.YT && window.YT.Player) {
      createPlayer()
    }

    return () => stopSavingProgress()
  }, [videoId, lessonId, user?.id])

  const startSavingProgress = () => {
    if (saveIntervalRef.current) return
    saveIntervalRef.current = setInterval(async () => {
      if (playerRef.current && user && lessonId) {
        const currentTime = Math.floor(playerRef.current.getCurrentTime())
        const duration = playerRef.current.getDuration()
        const isCompleted = currentTime > (duration * 0.9) // 90% completion

        await supabase.rpc('upsert_lesson_progress', {
          p_lesson_id: lessonId,
          p_pos_seconds: currentTime,
          p_is_completed: isCompleted
        })
      }
    }, 10000) // Every 10 seconds
  }

  const stopSavingProgress = () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current)
      saveIntervalRef.current = null
    }
  }

  return (
    <div ref={containerRef} style={{ 
      width: '100%', 
      aspectRatio: '16/9', 
      borderRadius: 'var(--radius-card)', 
      overflow: 'hidden',
      background: '#000',
      border: '1px solid var(--border-soft)',
      boxShadow: 'var(--shadow-elevated)',
      position: 'relative'
    }}>
      <div id="youtube-player" style={{ width: '100%', height: '100%' }} />
      {!isReady && (
        <div style={loadingOverlayStyle}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3461FF', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite' }} />
        </div>
      )}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const loadingOverlayStyle = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#000', zIndex: 1
}

