// src/components/lesson/VideoPlayer.jsx
// Polished YouTube embed wrapper with error states

import { getEmbedUrl, isValidYouTubeId } from '../../utils/youtube'

export default function VideoPlayer({ videoId }) {
  const isValid = isValidYouTubeId(videoId)
  const embedUrl = getEmbedUrl(videoId)

  return (
    <div style={{ 
      width: '100%', 
      aspectRatio: '16/9', 
      borderRadius: 'var(--radius-card)', 
      overflow: 'hidden',
      background: '#000',
      border: '1px solid var(--border-soft)',
      boxShadow: 'var(--shadow-elevated)',
      position: 'relative'
    }}>
      {!videoId ? (
        <div style={errorOverlayStyle}>
          <span style={{ fontSize: '2rem', marginBottom: '12px' }}>🎞️</span>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Video dars hali mavjud emas
          </p>
        </div>
      ) : !isValid ? (
        <div style={errorOverlayStyle}>
          <span style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</span>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Video manzili noto'g'ri (Invalid ID)
          </p>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title="Lesson Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  )
}

const errorOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '24px'
}
