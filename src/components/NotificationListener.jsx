import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'

export default function NotificationListener() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to INSERT events on public.notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const { new: notif } = payload
          
          // Trigger a beautiful glowing toast
          toast(notif.title, {
            description: notif.message,
            icon: <Bell color="#3461FF" fill="currentColor" size={20} />,
            style: {
              background: '#0F172A',
              color: 'white',
              border: '1px solid rgba(52,97,255,0.3)',
              boxShadow: '0 8px 32px rgba(52,97,255,0.2)',
            },
            duration: 5000,
          })
          
          // We can also trigger a custom event so other components (like navbar) know to re-fetch unread counts
          window.dispatchEvent(new CustomEvent('bma:new-notification'))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  return null // This component doesn't render anything visually
}
