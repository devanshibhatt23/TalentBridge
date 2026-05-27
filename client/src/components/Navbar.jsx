import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, dashboardPath, logout } = useAuth()

  function onSignOut() {
    logout()
    navigate('/login')
  }

  return (
    <header className="nav">
      <div className="container nav__inner">
        <div className="nav__left">
          <NavLink
            to={isAuthenticated ? dashboardPath : '/'}
            className="brand"
            aria-label="TalentBridge Home"
          >
            <span className="brand__mark" aria-hidden="true">
              TB
            </span>
            <span className="brand__text">TalentBridge</span>
          </NavLink>
        </div>

        <nav className="nav__right" aria-label="Primary">
          {isAuthenticated ? (
            <>
              <NavLink className="navlink" to={dashboardPath}>
                Dashboard
              </NavLink>
              <NavLink className="navlink" to="/jobs">
                Jobs
              </NavLink>
              {user.role === 'candidate' ? (
                <NavLink className="navlink" to="/my-applications">
                  Applications
                </NavLink>
              ) : null}
              {user.role === 'recruiter' ? (
                <>
                  <NavLink className="navlink" to="/jobs/new">
                    Post job
                  </NavLink>
                  <NavLink className="navlink" to="/candidates">
                    Candidates
                  </NavLink>
                </>
              ) : null}
              <span className="nav__meta" title={user.email}>
                {user.name}
              </span>
              <button className="btn btn--ghost" type="button" onClick={onSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink className="navlink" to="/jobs">
                Jobs
              </NavLink>
              <NavLink className="navlink" to="/login">
                Login
              </NavLink>
              <NavLink className="btn btn--primary" to="/register">
                Create account
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
