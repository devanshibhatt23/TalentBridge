import { useEffect, useState } from 'react'
import { Alert } from '../components/Alert.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatStatus } from '../utils/formatters.js'

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
          <h1 className="h1">My Profile</h1>
          <p className="muted">Manage your personal information and preferences.</p>
        </div>
      </div>

      <Alert type="error">{error}</Alert>

      <div className="grid grid--2">
        <section className="card">
          <h2 className="h2">Account Details</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <dl className="detail-list">
              <dt>Name</dt>
              <dd>{user?.name}</dd>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
              <dt>Account Type</dt>
              <dd className="muted">{formatStatus(user?.role)}</dd>
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
          <h2 className="h2">Coming Soon</h2>
          <p className="muted">
            We are working on adding more features to your profile. Soon you'll be able to update your skills, upload multiple resumes, and manage your portfolio directly from here.
          </p>
        </section>
      </div>
    </div>
  )
}

