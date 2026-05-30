import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { applyToJob } from '../services/api.js'

export function ApplyModal({ isOpen, onClose, job, onSuccess }) {
  const { user } = useAuth()
  const [resumeFile, setResumeFile] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !job) return null

  const handleApply = async (e) => {
    e.preventDefault()
    
    if (!resumeFile) {
      setError('Please upload your resume (PDF) to apply.')
      return
    }

    setApplying(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('jobId', job._id)
      if (coverLetter.trim()) {
        formData.append('coverLetter', coverLetter.trim())
      }
      formData.append('resume', resumeFile)

      await applyToJob(formData)
      onSuccess()
    } catch (err) {
      setError(err.message)
      setApplying(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-card--glass" style={{ maxWidth: '500px', width: '90%' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        <h2 className="h2" style={{ marginBottom: '8px' }}>Apply for {job.title}</h2>
        <p className="muted" style={{ marginBottom: '24px' }}>
          {job.company} · {job.location}
        </p>

        {error ? (
          <div className="alert alert--error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        ) : null}

        <div className="card" style={{ padding: '16px', marginBottom: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Your Profile Summary</h3>
          <p style={{ margin: 0, fontSize: '14px' }}><strong>Headline:</strong> {user?.profile?.headline || 'Not provided'}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
            <strong>Skills:</strong> {user?.profile?.skills?.length ? user.profile.skills.join(', ') : 'None listed'}
          </p>
        </div>

        <form onSubmit={handleApply} className="stack">
          <label className="field">
            <span className="field__label">Resume (PDF) <span style={{color: 'var(--warning)'}}>*</span></span>
            <div className="file-upload">
              <input
                id="resume-upload"
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                required
              />
              <label htmlFor="resume-upload" style={{ cursor: 'pointer', display: 'block' }}>
                {resumeFile ? (
                  <span className="resume-badge">📄 {resumeFile.name}</span>
                ) : (
                  <span>Click to upload resume</span>
                )}
              </label>
            </div>
            <span className="muted" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Our AI matches your resume to the job description for the recruiter.
            </span>
          </label>

          <label className="field">
            <span className="field__label">Cover Letter / Message (Optional)</span>
            <textarea
              className="input textarea"
              rows={3}
              placeholder="Why are you a good fit for this role?"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </label>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" className="btn btn--primary" disabled={applying}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
