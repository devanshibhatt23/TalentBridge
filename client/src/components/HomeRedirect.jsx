import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function HomeRedirect() {
  const { user, loading, dashboardPath } = useAuth()

  if (loading) {
    return (
      <div className="container page">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to={dashboardPath} replace />
  }

  return <Navigate to="/login" replace />
}
