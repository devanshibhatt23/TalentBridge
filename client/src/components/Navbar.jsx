import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { ProfileMenu } from './ProfileMenu.jsx'

export function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, dashboardPath, logout } = useAuth()
  const { totalUnread } = useNotifications()
  const { theme, toggleTheme } = useTheme()

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
            <span className="brand__mark" aria-hidden="true" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14C4 14 6 16 10 16C14 16 16 12 20 12C20 12 20 22 20 22C16 22 14 18 10 18C6 18 4 20 4 20V14Z" fill="url(#paint0_linear)"/>
                <path d="M4 4C4 4 6 6 10 6C14 6 16 2 20 2C20 2 20 12 20 12C16 12 14 8 10 8C6 8 4 10 4 10V4Z" fill="url(#paint1_linear)"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="4" y1="14" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--primary)"/>
                    <stop offset="1" stopColor="var(--accent)"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="4" y1="2" x2="20" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--primary)"/>
                    <stop offset="1" stopColor="var(--accent)"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="brand__text">TalentBridge</span>
          </NavLink>
        </div>

        <nav className="nav__right" aria-label="Primary">
          {loading ? (
            <div style={{ width: '150px', height: '36px', opacity: 0.5, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}></div>
          ) : isAuthenticated ? (
            <>
              <button 
                onClick={toggleTheme} 
                className="btn btn--icon" 
                aria-label="Toggle theme"
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '8px', borderRadius: '50%', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <NavLink className="navlink" to={dashboardPath}>
                Dashboard
              </NavLink>
              <NavLink className="navlink" to="/jobs">
                Jobs
              </NavLink>
              <NavLink className="navlink navlink--with-badge" to="/messages">
                Messages
                {totalUnread > 0 && (
                  <>
                    <span className="navlink__badge" aria-label={`${totalUnread} unread messages`}>
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                    <span className="navlink__pulse" aria-hidden="true"></span>
                  </>
                )}
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
              <ProfileMenu user={user} onSignOut={onSignOut} />
            </>
          ) : (
            <>
              <button 
                onClick={toggleTheme} 
                className="btn btn--icon" 
                aria-label="Toggle theme"
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '8px', borderRadius: '50%', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <NavLink className="navlink" to="/features">
                Features
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
