import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { StatusBadge } from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  applyToJob,
  deleteJob,
  downloadResume,
  fetchJobApplications,
  fetchJobById,
  updateApplicationStatus,
  updateJob,
} from '../services/api.js'
import apiMap from '../api.json'

export function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const postedById = job?.postedBy?._id || job?.postedBy
  const isOwner = Boolean(
    job &&
      user?.role === 'recruiter' &&
      postedById &&
      String(postedById) === String(user.id),
  )

  async function loadJob() {
    setLoading(true)
    setError('')
    try {
      const res = await fetchJobById(id)
      setJob(res.data?.job)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadApplications() {
    if (!isOwner) return
    try {
      const res = await fetchJobApplications(id)
      setApplications(res.data?.applications || [])
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadJob()
  }, [id])

  useEffect(() => {
    if (!job || !user) return
    const owner =
      user.role === 'recruiter' &&
      String(job.postedBy?._id || job.postedBy) === String(user.id)
    if (owner) loadApplications()
  }, [job, user, id])

  async function handleApply(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const formData = new FormData()
      formData.append('jobId', id)
      formData.append('coverLetter', coverLetter)
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }
      await applyToJob(formData)
      setMessage('Application submitted successfully.')
      setCoverLetter('')
      setResumeFile(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDownloadResume(application) {
    setError('')
    try {
      const blob = await downloadResume(application._id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = application.resume?.filename || 'resume.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCloseJob() {
    if (!window.confirm('Close this job? Candidates will no longer be able to apply.')) return
    setError('')
    try {
      const res = await updateJob(id, { status: 'closed' })
      setJob(res.data?.job)
      setMessage('Job closed.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteJob() {
    if (!window.confirm('Delete this job permanently?')) return
    setError('')
    try {
      await deleteJob(id)
      navigate('/recruiter-dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleStatusChange(applicationId, status) {
    setError('')
    try {
      await updateApplicationStatus(applicationId, { status })
      await loadApplications()
      setMessage(`Status updated to ${status}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <p className="muted">Loading job…</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container page">
        <Alert type="error">{error || 'Job not found.'}</Alert>
        <Link to="/jobs" className="btn">Back to jobs</Link>
      </div>
    )
  }

  return (
    <div className="container page">
      <div className="page__header">
        <div>
          <h1 className="h1">{job.title}</h1>
          <p className="muted">
            {job.company} · {job.location} · {job.jobType}
          </p>
        </div>
        <div className="page__actions">
          <StatusBadge status={job.status} />
          {isOwner ? (
            <>
              {job.status === 'open' ? (
                <button className="btn btn--ghost" type="button" onClick={handleCloseJob}>
                  Close job
                </button>
              ) : null}
              <button className="btn btn--ghost" type="button" onClick={handleDeleteJob}>
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>

      <Alert type="error">{error}</Alert>
      <Alert type="success">{message}</Alert>

      <div className="grid grid--2">
        <section className="card">
          <h2 className="h2">Description</h2>
          <p className="prose">{job.description}</p>
          <h2 className="h2 section-gap">Requirements</h2>
          <p className="prose">{job.requirements}</p>
          {job.skills?.length > 0 ? (
            <div className="tags section-gap">
              {job.skills.map((skill) => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          ) : null}
        </section>

        <aside className="stack">
          {user?.role === 'candidate' && job.status === 'open' ? (
            <form className="card" onSubmit={handleApply}>
              <h2 className="h2">Apply</h2>
              <label className="field">
                <span className="field__label">Cover letter (optional)</span>
                <textarea
                  className="input textarea"
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field__label">Resume (PDF, optional)</span>
                <input
                  className="input"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                {resumeFile ? (
                  <p className="muted">Selected file: {resumeFile.name}</p>
                ) : null}
              </label>
              <button className="btn btn--primary" type="submit">
                Submit application
              </button>
            </form>
          ) : null}

          {isOwner ? (
            <section className="card">
              <h2 className="h2">Applications ({applications.length})</h2>
              {applications.length === 0 ? (
                <p className="muted">No applications yet.</p>
              ) : (
                <ul className="app-list">
                  {applications.map((app) => (
                    <li key={app._id} className="app-list__item">
                      <div>
                        <strong>{app.candidate?.name}</strong>
                        {app.matchScore !== undefined && app.matchScore !== null ? (
                          <span className="tag" style={{ marginLeft: '8px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                            Match: {app.matchScore}%
                          </span>
                        ) : null}
                        <p className="muted">{app.candidate?.email}</p>
                        <StatusBadge status={app.status} />
                      </div>
                      <select
                        className="input"
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        {apiMap.applicationStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {app.resume?.filename ? (
                        <button
                          className="btn btn--secondary"
                          type="button"
                          onClick={() => handleDownloadResume(app)}
                        >
                          Download resume
                        </button>
                      ) : (
                        <p className="muted">No resume uploaded.</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
