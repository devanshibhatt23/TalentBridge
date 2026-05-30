import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { ProfileMenu } from './ProfileMenu.jsx'

export function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, dashboardPath, logout } = useAuth()
  const { totalUnread } = useNotifications()

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
