import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export function useUnreadNotifications() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return;

    const fetchCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      
      setUnreadCount(count || 0)
    }

    fetchCount()

    // Listen to custom event fired by NotificationListener and NotificationsPage
    const handleUpdate = () => {
      fetchCount()
    }
    
    window.addEventListener('bma:new-notification', handleUpdate)

    return () => {
      window.removeEventListener('bma:new-notification', handleUpdate)
    }
  }, [user?.id])

  return unreadCount
}
