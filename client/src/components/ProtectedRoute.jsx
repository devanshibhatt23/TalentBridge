import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function ProtectedRoute({ children, roles }) {
  const { user, loading, dashboardPath } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container page">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={dashboardPath} replace />
  }

  return children
}
