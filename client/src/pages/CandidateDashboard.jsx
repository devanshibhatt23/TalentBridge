import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { StatusBadge } from '../components/StatusBadge.jsx'
import { JobCard } from '../components/JobCard.jsx'
import { Spinner } from '../components/Spinner.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchJobs, fetchMyApplications } from '../services/api.js'

export function CandidateDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          fetchMyApplications(),
          fetchJobs({ limit: 4, sortBy: 'createdAt', order: 'desc' }),
        ])
        setApplications(appsRes.data?.applications || [])
        setRecommended(jobsRes.data?.jobs || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeApplications = applications.filter(app => app.status !== 'withdrawn' && app.status !== 'rejected')

  return (
    <div className="container page">
      {/* Hero Welcome Section */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(244, 63, 94, 0.08) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 className="h1" style={{ fontSize: '28px', marginBottom: '8px' }}>
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: '15px' }}>
            You have <strong style={{ color: 'var(--text)' }}>{activeApplications.length} active</strong> application{activeApplications.length !== 1 ? 's' : ''}. Keep exploring new opportunities!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link className="btn btn--primary" to="/jobs">
            Browse Jobs
          </Link>
          <Link className="btn btn--ghost" to="/profile">
            Update Profile
          </Link>
        </div>
      </div>

      <Alert type="error">{error}</Alert>

      <div className="grid grid--2" style={{ alignItems: 'flex-start' }}>
        <section className="stack" style={{ gap: '16px' }}>
          <div className="card__header-row">
            <h2 className="h2" style={{ margin: 0 }}>Recent Applications</h2>
            <Link className="navlink" to="/my-applications" style={{ fontSize: '14px' }}>
              View all
            </Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <Spinner message="Loading applications..." />
            </div>
          ) : applications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
              <p className="muted" style={{ margin: '0 0 16px 0' }}>You haven't applied to any jobs yet.</p>
              <Link className="btn btn--secondary" to="/jobs">Find your first job</Link>
            </div>
          ) : (
            <div className="stack">
              {applications.slice(0, 3).map((app) => (
                <div key={app._id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>
                        <Link to={`/jobs/${app.job?._id}`} style={{ textDecoration: 'none' }}>
                          {app.job?.title}
                        </Link>
                      </h3>
                      <p className="muted" style={{ margin: 0, fontSize: '13px' }}>
                        {app.job?.company} · {app.job?.location}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="stack" style={{ gap: '16px' }}>
          <div className="card__header-row">
            <h2 className="h2" style={{ margin: 0 }}>Latest Opportunities</h2>
            <Link className="navlink" to="/jobs" style={{ fontSize: '14px' }}>
              Browse
            </Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <Spinner message="Loading jobs..." />
            </div>
          ) : recommended.length === 0 ? (
            <div className="card">
              <p className="muted">No open jobs right now. Check back later!</p>
            </div>
          ) : (
            <div className="stack">
              {recommended.slice(0, 3).map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
