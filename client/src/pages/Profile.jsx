import { useEffect, useState } from 'react'
import { Alert } from '../components/Alert.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatStatus } from '../utils/formatters.js'
import { ProfileSetupModal } from '../components/ProfileSetupModal.jsx'

export function Profile() {
  const { user, refreshUser } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

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

        {user?.role === 'candidate' ? (
          <section className="card">
            <div className="card__header-row">
              <h2 className="h2">Candidate Profile</h2>
              <button 
                className="btn btn--ghost"
                onClick={() => setShowSetup(true)}
              >
                Edit
              </button>
            </div>
            
            <dl className="detail-list">
              <dt>Headline</dt>
              <dd>{user.profile?.headline || <span className="muted">Not provided</span>}</dd>
              
              <dt>Skills</dt>
              <dd>
                {user.profile?.skills?.length ? (
                  <div className="tags" style={{ marginTop: '4px' }}>
                    {user.profile.skills.map((skill, i) => (
                      <span key={i} className="tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <span className="muted">No skills added</span>
                )}
              </dd>

              <dt>Bio</dt>
              <dd>{user.profile?.bio || <span className="muted">Not provided</span>}</dd>
              
              <dt>Experience</dt>
              <dd>{user.profile?.experience || <span className="muted">Not provided</span>}</dd>
              
              <dt>Education</dt>
              <dd>{user.profile?.education || <span className="muted">Not provided</span>}</dd>
            </dl>
          </section>
        ) : (
          <section className="card">
            <h2 className="h2">Recruiter Info</h2>
            <p className="muted">
              You are signed in as a Recruiter for <strong>{user?.company}</strong>.
            </p>
          </section>
        )}
      </div>

      {showSetup && (
        <ProfileSetupModal 
          isOpen={showSetup} 
          onClose={() => setShowSetup(false)} 
          onComplete={() => setShowSetup(false)} 
        />
      )}
    </div>
  )
}

