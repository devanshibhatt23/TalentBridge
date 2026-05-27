import { useEffect, useState } from 'react'
import { Alert } from '../components/Alert.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export function Profile() {
  const { user, refreshUser } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        await refreshUser()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshUser])

  return (
    <div className="container page">
      <div className="page__header">
        <div>
          <h1 className="h1">Profile</h1>
          <p className="muted">Account details from `GET /api/auth/me`.</p>
        </div>
      </div>

      <Alert type="error">{error}</Alert>

      <div className="grid grid--2">
        <section className="card">
          <h2 className="h2">Basics</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <dl className="detail-list">
              <dt>Name</dt>
              <dd>{user?.name}</dd>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
              <dt>Role</dt>
              <dd className="muted">{user?.role}</dd>
              {user?.company ? (
                <>
                  <dt>Company</dt>
                  <dd>{user.company}</dd>
                </>
              ) : null}
              {user?.phone ? (
                <>
                  <dt>Phone</dt>
                  <dd>{user.phone}</dd>
                </>
              ) : null}
            </dl>
          )}
        </section>

        <section className="card">
          <h2 className="h2">Next</h2>
          <p className="muted">
            Next improvements: editable profile (candidate fields like skills/education),
            and resume upload wiring.
          </p>
        </section>
      </div>
    </div>
  )
}

