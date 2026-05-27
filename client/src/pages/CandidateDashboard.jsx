import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { StatusBadge } from '../components/StatusBadge.jsx'
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
        setApplications(appsRes.data?.applications?.slice(0, 4) || [])
        setRecommended(jobsRes.data?.jobs || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="container page">
      <div className="page__header">
        <div>
          <h1 className="h1">Candidate dashboard</h1>
          <p className="muted">Welcome, {user?.name}</p>
        </div>
        <Link className="btn btn--primary" to="/jobs">
          Browse jobs
        </Link>
      </div>

      <Alert type="error">{error}</Alert>

      <div className="grid grid--2">
        <section className="card">
          <div className="card__header-row">
            <h2 className="h2">Applied jobs</h2>
            <Link className="navlink" to="/my-applications">
              View all
            </Link>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : applications.length === 0 ? (
            <p className="muted">No applications yet.</p>
          ) : (
            <ul className="simple-list">
              {applications.map((app) => (
                <li key={app._id}>
                  <Link to={`/jobs/${app.job?._id}`}>{app.job?.title}</Link>
                  <StatusBadge status={app.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card__header-row">
            <h2 className="h2">Recommended positions</h2>
            <Link className="navlink" to="/jobs">
              Browse
            </Link>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : recommended.length === 0 ? (
            <p className="muted">No open jobs right now.</p>
          ) : (
            <ul className="simple-list">
              {recommended.map((job) => (
                <li key={job._id}>
                  <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                  <span className="muted">{job.company}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
