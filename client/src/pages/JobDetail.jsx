import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { StatusBadge } from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import {
  deleteJob,
  downloadResume,
  fetchJobApplications,
  fetchJobById,
  updateApplicationStatus,
  updateJob,
} from '../services/api.js'

import { ProfileSetupModal } from '../components/ProfileSetupModal.jsx'
import { ApplyModal } from '../components/ApplyModal.jsx'
import { Spinner } from '../components/Spinner.jsx'
import { formatJobType, formatDate } from '../utils/formatters.js'
import confetti from 'canvas-confetti'
import apiMap from '../api.json'

export function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useNotifications()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasApplied, setHasApplied] = useState(false)
  
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)

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

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Check if profile is complete (has a headline)
    if (!user.profile?.headline || !user.profile?.skills?.length) {
      setShowSetupModal(true)
    } else {
      setShowApplyModal(true)
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
      addToast('success', 'Job Closed', 'Candidates will no longer be able to apply.')
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
      addToast('success', 'Status Updated', `Candidate moved to ${status}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('applicationId', appId)
    e.dataTransfer.effectAllowed = 'move'
    // Give browser time to capture the ghost image before changing styles
    setTimeout(() => {
      e.target.style.opacity = '0.5'
      e.target.style.transform = 'rotate(2deg) scale(0.95)'
      e.target.style.boxShadow = 'var(--shadow-glow)'
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    e.target.style.transform = 'none'
    e.target.style.boxShadow = 'var(--shadow-sm)'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault()
    const appId = e.dataTransfer.getData('applicationId')
    if (appId) {
      const app = applications.find(a => a._id === appId)
      if (app && app.status !== targetStatus) {
        await handleStatusChange(appId, targetStatus)
      }
    }
  }

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'applied':
      case 'open': return '#c4b5fd' // Violet
      case 'screening': return '#fcd34d' // Amber
      case 'interviewing': return '#6ee7b7' // Emerald (Green)
      case 'offered': return '#7dd3fc' // Sky Blue
      case 'hired': return '#5eead4' // Teal
      case 'rejected':
      case 'withdrawn':
      case 'closed': return '#fda4af' // Rose
      default: return 'var(--border)'
    }
  }

  if (loading) {
    return (
      <div className="container page" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner message="Loading job details..." />
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
            {job.company} · {job.location} · {formatJobType(job.jobType)}
            {job.deadline && ` · Apply by ${formatDate(job.deadline)}`}
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

      {isOwner ? (
        <div className="grid grid--2">
          <section className="card">
            <h2 className="h2">Description</h2>
            <p className="prose">{job.description}</p>
          </section>
          <section className="card">
            <h2 className="h2">Requirements</h2>
            <p className="prose">{job.requirements}</p>
            {job.skills?.length > 0 ? (
              <div className="tags section-gap">
                {job.skills.map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : (
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
            {user?.role === 'candidate' && job.status === 'open' && !hasApplied ? (
              <div className="card section-gap stack" style={{ textAlign: 'center', padding: '32px' }}>
                <h2 className="h2" style={{ marginBottom: '8px' }}>Ready to join?</h2>
                <p className="muted" style={{ marginBottom: '24px' }}>
                  Take the next step in your career by applying to this position.
                </p>
                <button 
                  className="btn btn--primary" 
                  style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                  onClick={handleApplyClick}
                >
                  Apply Now ✨
                </button>
              </div>
            ) : null}

            {hasApplied && user?.role === 'candidate' && (
              <div className="card section-gap stack" style={{ textAlign: 'center', padding: '32px', border: '1px solid var(--success-light)' }}>
                <h2 className="h2" style={{ color: 'var(--success-dark)' }}>Applied Successfully!</h2>
                <p className="muted">You have already submitted an application for this role.</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {isOwner ? (
        <section className="card section-gap" style={{ marginTop: '24px' }}>
          <h2 className="h2" style={{ marginBottom: '16px' }}>Applications Board ({applications.length})</h2>
          {applications.length === 0 ? (
            <p className="muted">No applications yet.</p>
          ) : (
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
              {apiMap.applicationStatuses.map(status => {
                const columnApps = applications.filter(app => app.status === status);
                if (columnApps.length === 0 && (status === 'withdrawn' || status === 'rejected')) return null; // hide empty negative columns

                return (
                  <div 
                    key={status} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                    style={{ 
                      minWidth: '300px', 
                      flex: '0 0 auto', 
                      background: 'var(--panel)', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      border: '1px solid var(--border)',
                      borderTop: `4px solid ${getStatusColor(status)}`
                    }}
                  >
                    <h3 style={{ margin: '0 0 16px', textTransform: 'capitalize', fontSize: '15px', color: getStatusColor(status), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {status} 
                      <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '99px', fontSize: '12px', color: 'var(--text)' }}>
                        {columnApps.length}
                      </span>
                    </h3>
                    <div className="stack">
                      {columnApps.map(app => (
                        <div 
                          key={app._id} 
                          className="card" 
                          draggable
                          onDragStart={(e) => handleDragStart(e, app._id)}
                          onDragEnd={handleDragEnd}
                          style={{ 
                            padding: '16px', 
                            background: 'var(--panel-strong)', 
                            borderLeft: `4px solid ${getStatusColor(app.status)}`, 
                            cursor: 'grab',
                            transition: 'all 0.2s ease',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <div style={{ marginBottom: '12px' }}>
                            <strong style={{ fontSize: '16px', color: 'var(--text)' }}>{app.candidate?.name}</strong>
                            <p className="muted" style={{ margin: 0, fontSize: '13px' }}>{app.candidate?.email}</p>
                          </div>
                          
                          {app.matchScore !== undefined && app.matchScore !== null && (
                            <div style={{ marginBottom: '12px' }}>
                              <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-dim)' }}>
                                ✨ Match: {app.matchScore}%
                              </span>
                            </div>
                          )}
                          
                          <select
                            className="input"
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            style={{ width: '100%', marginBottom: '8px', padding: '8px', fontSize: '13px' }}
                          >
                            {apiMap.applicationStatuses.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          
                          {app.resume?.filename ? (
                            <button
                              className="btn btn--secondary"
                              type="button"
                              onClick={() => handleDownloadResume(app)}
                              style={{ width: '100%', fontSize: '13px', padding: '8px' }}
                            >
                              📄 Resume
                            </button>
                          ) : (
                            <p className="muted" style={{ fontSize: '12px', textAlign: 'center', margin: '8px 0 0' }}>No resume uploaded.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      <ProfileSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onComplete={() => {
          setShowSetupModal(false)
          setShowApplyModal(true)
        }}
      />

      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={job}
        onSuccess={() => {
          setShowApplyModal(false)
          setHasApplied(true)
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#f43f5e', '#ffffff']
          })
          addToast('success', 'Application Submitted', 'Your application has been sent successfully!')
        }}
      />
    </div>
  )
}
