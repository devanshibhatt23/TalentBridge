import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function initials(nameOrEmail) {
  const raw = (nameOrEmail || '').trim()
  if (!raw) return 'U'
  const parts = raw.split(/\s+/).slice(0, 2)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function ProfileMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  const label = useMemo(() => initials(user?.name || user?.email), [user])

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!open) return
      const t = e.target
      if (btnRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  return (
    <div className="profilemenu">
      <button
        ref={btnRef}
        className="avatar-btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
      >
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt="Avatar" 
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} 
          />
        ) : (
          <span className="avatar" aria-hidden="true">
            {label}
          </span>
        )}
      </button>

      {open ? (
        <div ref={menuRef} className="menu" role="menu" aria-label="Profile">
          <div className="menu__header">
            <div className="menu__name">{user?.name || 'User'}</div>
            <div className="menu__meta">{user?.email}</div>
          </div>
          <Link className="menu__item" to="/profile" role="menuitem" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <button
            className="menu__item menu__danger"
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}

