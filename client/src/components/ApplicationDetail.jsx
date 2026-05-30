import { useState, useEffect } from 'react'
import { downloadResume, getResumeInfo, updateResume } from '../services/api.js'
import { Alert } from './Alert.jsx'

export function ApplicationDetail({ application, onClose, onResumeUpdated }) {
  const [resumeInfo, setResumeInfo] = useState(null)
  const [isLoadingResume, setIsLoadingResume] = useState(false)
  const [isUpdatingResume, setIsUpdatingResume] = useState(false)
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

  async function handleUpdateResume(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setError('')
      setSuccess('')
      setIsUpdatingResume(true)
      const res = await updateResume(application._id, file)
      setResumeInfo(res.data?.application?.resume)
      setSuccess('Resume updated successfully!')
      if (onResumeUpdated) {
        onResumeUpdated(res.data?.application)
      }
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update resume')
    } finally {
      setIsUpdatingResume(false)
    }
  }

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
        style={{
          backgroundColor: 'var(--color-background)',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
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
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                    {resumeInfo.filename}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {formatFileSize(resumeInfo.size)} • Uploaded {formatDate(resumeInfo.uploadedAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn--secondary"
                    onClick={handleDownloadResume}
                    disabled={isLoadingResume}
                  >
                    {isLoadingResume ? 'Downloading…' : 'Download'}
                  </button>
                  <label className="btn btn--secondary" style={{ cursor: 'pointer', marginBottom: 0 }}>
                    {isUpdatingResume ? 'Updating…' : 'Replace'}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleUpdateResume}
                      disabled={isUpdatingResume}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '1rem',
                  border: '1px dashed var(--color-border)',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                }}
              >
                <p style={{ margin: '0 0 0.5rem 0' }}>No resume attached to this application.</p>
                <label className="btn btn--primary" style={{ cursor: 'pointer', marginBottom: 0 }}>
                  Upload Resume
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleUpdateResume}
                    disabled={isUpdatingResume}
                    style={{ display: 'none' }}
                  />
                </label>
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
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--color-surface)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
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
