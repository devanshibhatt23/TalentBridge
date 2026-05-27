import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { dashboardPathForRole } from '../services/api.js'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('candidate')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim() || undefined,
        company: role === 'recruiter' ? company.trim() : undefined,
      })
      navigate(dashboardPathForRole(user.role), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container page">
      <div className="auth">
        <div className="auth__header">
          <h1 className="h1">Create your account</h1>
          <p className="muted">Join as a recruiter or candidate.</p>
        </div>

        <form className="card auth__card" onSubmit={onSubmit}>
          <Alert type="error">{error}</Alert>

          <label className="field">
            <span className="field__label">Full name</span>
            <input
              className="input"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Phone (optional)</span>
            <input
              className="input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Role</span>
            <div className="segmented">
              <button
                className={role === 'candidate' ? 'segmented__btn is-active' : 'segmented__btn'}
                type="button"
                onClick={() => setRole('candidate')}
              >
                Candidate
              </button>
              <button
                className={role === 'recruiter' ? 'segmented__btn is-active' : 'segmented__btn'}
                type="button"
                onClick={() => setRole('recruiter')}
              >
                Recruiter
              </button>
            </div>
          </label>

          {role === 'recruiter' ? (
            <label className="field">
              <span className="field__label">Company</span>
              <input
                className="input"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </label>
          ) : null}

          <button className="btn btn--primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating…' : 'Create account'}
          </button>

          <p className="auth__footer muted">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
