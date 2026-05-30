import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { ApplicationDetail } from '../components/ApplicationDetail.jsx'
import { StatusBadge } from '../components/StatusBadge.jsx'
import { fetchMyApplications } from '../services/api.js'
import { getSocket } from '../socket.js'

export function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchMyApplications()
        setApplications(res.data?.applications || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const s = getSocket()
    function onStatusChanged() {
      fetchMyApplications()
        .then((res) => setApplications(res.data?.applications || []))
        .catch(() => {})
    }
    s.on('application:statusChanged', onStatusChanged)
    return () => {
      s.off('application:statusChanged', onStatusChanged)
    }
  }, [])

  function handleResumeUpdated(updatedApplication) {
    setApplications((prev) =>
      prev.map((app) =>
        app._id === updatedApplication._id ? { ...app, ...updatedApplication } : app
      )
    )
  }

  return (
    <div className="container page">
      <div className="page__header">
        <h1 className="h1">My applications</h1>
      </div>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : applications.length === 0 ? (
        <div className="card">
          <p className="muted">You have not applied to any jobs yet.</p>
          <Link className="btn btn--primary" to="/jobs">Browse jobs</Link>
        </div>
      ) : (
        <div className="stack">
          {applications.map((app) => (
            <article 
              key={app._id} 
              className="card" 
              style={{ 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedApp(app)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow), var(--shadow-glow)'
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'var(--shadow)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h3 className="h2" style={{ margin: '0 0 4px 0', fontSize: '20px' }}>
                    <Link 
                      to={`/jobs/${app.job?._id}`} 
                      onClick={(e) => e.stopPropagation()} 
                      style={{ textDecoration: 'none', color: 'var(--text)' }}
                    >
                      {app.job?.title}
                    </Link>
                  </h3>
                  <p className="muted" style={{ margin: 0, fontSize: '15px' }}>
                    {app.job?.company} · {app.job?.location}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <p className="muted" style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🕒</span> 
                  {app.statusHistory?.length > 0 
                    ? `Last update: ${app.statusHistory[app.statusHistory.length - 1]?.note}`
                    : 'Application submitted'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {app.resume?.filename && (
                    <span className="nav__meta" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--primary)' }}>📄</span> Resume attached
                    </span>
                  )}
                  {app.matchScore && (
                    <span className="nav__meta" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', borderColor: 'var(--accent-dim)', background: 'rgba(16, 185, 129, 0.05)' }}>
                      ✨ Match: {app.matchScore}%
                    </span>
                  )}
                </div>
                <button
                  className="btn btn--primary"
                  style={{ padding: '8px 16px' }}
                >
                  View Details →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedApp && (
        <ApplicationDetail
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onResumeUpdated={handleResumeUpdated}
        />
      )}
    </div>
  )
}
