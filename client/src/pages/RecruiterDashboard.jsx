import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { JobCard } from '../components/JobCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchMyJobs } from '../services/api.js'

export function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchMyJobs()
        setJobs(res.data?.jobs || [])
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
          <h1 className="h1">Recruiter dashboard</h1>
          <p className="muted">
            Welcome, {user?.name}
            {user?.company ? ` · ${user.company}` : ''}
          </p>
        </div>
        <div className="page__actions">
          <Link className="btn btn--primary" to="/jobs/new">
            Post job
          </Link>
          <Link className="btn btn--ghost" to="/candidates">
            Search candidates
          </Link>
        </div>
      </div>

      <Alert type="error">{error}</Alert>

      <section className="card">
        <h2 className="h2">Your active jobs</h2>
        {loading ? (
          <p className="muted">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <p className="muted">You have not posted any jobs yet.</p>
        ) : (
          <div className="stack section-gap">
            {jobs.slice(0, 5).map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
