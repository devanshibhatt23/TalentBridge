import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { dashboardPathForRole } from '../services/api.js'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const user = await login({ email: email.trim(), password })
      const from = location.state?.from
      const target =
        from && from !== '/login' && from !== '/register'
          ? from
          : dashboardPathForRole(user.role)
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-hero">
      <div className="auth-hero__orb"></div>
      
      <div className="auth-hero__inner">
        <div className="auth-hero__logo">
          <span className="auth-hero__mark">TB</span>
          <span className="auth-hero__brand">TalentBridge</span>
        </div>
        
        <div className="auth-hero__header">
          <h1 className="h1">Welcome back</h1>
          <p className="muted">Sign in to continue connecting with top talent.</p>
        </div>

        <form className="auth-card--glass" onSubmit={onSubmit}>
          <Alert type="error">{error}</Alert>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <div className="field--password">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <button className="btn btn--primary" disabled={isSubmitting} type="submit" style={{ marginTop: '8px' }}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="auth__footer muted">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
