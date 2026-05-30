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
            <article key={app._id} className="card list-card">
              <div className="list-card__top">
                <div>
                  <h3 className="list-card__title">
                    <Link to={`/jobs/${app.job?._id}`}>{app.job?.title}</Link>
                  </h3>
                  <p className="muted">
                    {app.job?.company} · {app.job?.location}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              {app.statusHistory?.length > 0 ? (
                <p className="muted list-card__meta">
                  Last update: {app.statusHistory[app.statusHistory.length - 1]?.note}
                </p>
              ) : null}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {app.resume?.filename && (
                  <span className="resume-badge">
                    📄 Resume attached
                  </span>
                )}
                <button
                  className="btn btn--secondary"
                  onClick={() => setSelectedApp(app)}
                  style={{ padding: '6px 12px', marginBottom: 0 }}
                >
                  View Details
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
