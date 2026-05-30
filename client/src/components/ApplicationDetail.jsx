import { useState, useEffect } from 'react'
import { downloadResume } from '../services/api.js'
import { Alert } from './Alert.jsx'

export function ApplicationDetail({ application, onClose }) {
  const [resumeInfo, setResumeInfo] = useState(null)
  const [isLoadingResume, setIsLoadingResume] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (application?.resume) {
      setResumeInfo(application.resume)
    }
  }, [application?.resume])

  async function handleDownloadResume() {
    try {
      setError('')
      setIsLoadingResume(true)
      const blob = await downloadResume(application._id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = resumeInfo?.filename || 'resume.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'Failed to download resume')
    } finally {
      setIsLoadingResume(false)
    }
  }

  // Replace functionality removed as per new business logic.

  function formatFileSize(bytes) {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  function formatDate(iso) {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString()
    } catch {
      return ''
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="auth-card--glass"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 0,
          gap: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            {application?.job?.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>

          {/* Resume Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>
              Resume
            </h3>
            {resumeInfo?.filename ? (
              <div
                style={{
                  padding: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
                    {resumeInfo.filename}
                  </div>
                  <div className="muted" style={{ fontSize: '13px' }}>
                    {formatFileSize(resumeInfo.size)} • Uploaded {formatDate(resumeInfo.uploadedAt)}
                  </div>
                </div>
                <button
                  className="btn btn--primary"
                  onClick={handleDownloadResume}
                  disabled={isLoadingResume}
                >
                  {isLoadingResume ? 'Downloading…' : 'Download PDF'}
                </button>
              </div>
                
            ) : (
              <div
                style={{
                  padding: '24px',
                  border: '1px dashed var(--border)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: 'var(--faint)',
                  background: 'rgba(255,255,255,0.02)'
                }}
              >
                <p style={{ margin: 0 }}>No resume attached to this application.</p>
              </div>
            )}
          </div>

          {/* Cover Letter Section */}
          {application?.coverLetter && (
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>
                Cover Letter
              </h3>
              <div
                style={{
                  padding: '16px',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: 'var(--text)'
                }}
              >
                {application.coverLetter}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
