import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export function ProfileSetupModal({ isOpen, onClose, onComplete }) {
  const { updateProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    headline: '',
    phone: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
  })

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!formData.headline) {
        setError('Headline is required.')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.skills) {
        setError('Please provide at least one skill.')
        return
      }
      setStep(3)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await updateProfile({
        phone: formData.phone,
        profile: {
          headline: formData.headline,
          bio: formData.bio,
          skills: formData.skills,
          experience: formData.experience,
          education: formData.education,
        },
      })
      onComplete()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-card--glass" style={{ maxWidth: '500px', width: '90%' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        <h2 className="h2" style={{ marginBottom: '8px' }}>Complete Your Profile</h2>
        <p className="muted" style={{ marginBottom: '24px' }}>
          Step {step} of 3
        </p>

        {error ? (
          <div className="alert alert--error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="stack">
          {step === 1 && (
            <>
              <label className="field">
                <span className="field__label">Professional Headline <span style={{color: 'var(--warning)'}}>*</span></span>
                <input
                  className="input"
                  name="headline"
                  placeholder="e.g. Full Stack Developer | React | Node.js"
                  value={formData.headline}
                  onChange={handleChange}
                  autoFocus
                />
              </label>
              <label className="field">
                <span className="field__label">Phone Number</span>
                <input
                  className="input"
                  name="phone"
                  placeholder="e.g. +1 234 567 890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn--primary" onClick={handleNext}>
                  Next →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <label className="field">
                <span className="field__label">Skills (comma separated) <span style={{color: 'var(--warning)'}}>*</span></span>
                <input
                  className="input"
                  name="skills"
                  placeholder="e.g. JavaScript, React, Python, SQL"
                  value={formData.skills}
                  onChange={handleChange}
                  autoFocus
                />
              </label>
              <label className="field">
                <span className="field__label">Short Bio</span>
                <textarea
                  className="input textarea"
                  name="bio"
                  placeholder="Tell recruiters a bit about yourself..."
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="button" className="btn btn--primary" onClick={handleNext}>
                  Next →
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label className="field">
                <span className="field__label">Experience summary</span>
                <textarea
                  className="input textarea"
                  name="experience"
                  placeholder="e.g. 3 years as a Frontend Dev at TechCorp..."
                  rows={3}
                  value={formData.experience}
                  onChange={handleChange}
                  autoFocus
                />
              </label>
              <label className="field">
                <span className="field__label">Education summary</span>
                <textarea
                  className="input textarea"
                  name="education"
                  placeholder="e.g. B.S. in Computer Science from University..."
                  rows={2}
                  value={formData.education}
                  onChange={handleChange}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Finish & Apply'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
