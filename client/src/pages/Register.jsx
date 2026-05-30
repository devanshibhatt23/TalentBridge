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
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="auth-hero" style={{ margin: '40px 0' }}>
      <div className="auth-hero__orb"></div>

      <div className="auth-hero__inner">
        <div className="auth-hero__logo">
          <span className="auth-hero__mark">TB</span>
          <span className="auth-hero__brand">TalentBridge</span>
        </div>

        <div className="auth-hero__header">
          <h1 className="h1">Create your account</h1>
          <p className="muted">Join as a recruiter or candidate.</p>
        </div>

        <form className="auth-card--glass" onSubmit={onSubmit}>
          <Alert type="error">{error}</Alert>

          <div className="role-selector">
            <button
              className={role === 'candidate' ? 'role-selector__btn is-active' : 'role-selector__btn'}
              type="button"
              onClick={() => setRole('candidate')}
            >
              <span className="role-selector__icon">👤</span>
              <span className="role-selector__label">Candidate</span>
              <span className="role-selector__desc">Find your next role</span>
            </button>
            <button
              className={role === 'recruiter' ? 'role-selector__btn is-active' : 'role-selector__btn'}
              type="button"
              onClick={() => setRole('recruiter')}
            >
              <span className="role-selector__icon">🏢</span>
              <span className="role-selector__label">Recruiter</span>
              <span className="role-selector__desc">Hire top talent</span>
            </button>
          </div>

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
            <div className="field--password">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
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

          {role === 'recruiter' && (
            <label className="field field--slide">
              <span className="field__label">Company</span>
              <input
                className="input"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </label>
          )}

          <button className="btn btn--primary" disabled={isSubmitting} type="submit" style={{ marginTop: '8px' }}>
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
