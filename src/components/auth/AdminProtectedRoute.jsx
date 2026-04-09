import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageSkeleton from '../ui/PageSkeleton'

export default function AdminProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageSkeleton />
  }

  if (!user || !isAdmin) {
    // If not logged in or not admin, redirect to login
    // We save the attempted URL to redirect back after login (though usually students shouldn't see admin urls)
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
