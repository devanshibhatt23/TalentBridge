import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { fetchCandidateById } from '../services/api.js'

export function CandidateProfile() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchCandidateById(id)
        setCandidate(res.data?.candidate)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="container page">
        <p className="muted">Loading profile…</p>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="container page">
        <Alert type="error">{error || 'Candidate not found.'}</Alert>
        <Link to="/candidates" className="btn">Back to search</Link>
      </div>
    )
  }

  const profile = candidate.profile || {}

  return (
    <div className="container page">
      <div className="page__header">
        <div>
          <h1 className="h1">{candidate.name}</h1>
          {profile.headline ? <p className="muted">{profile.headline}</p> : null}
        </div>
        <Link to="/candidates" className="btn btn--ghost">Back</Link>
      </div>

      <div className="grid grid--2">
        <section className="card">
          <h2 className="h2">About</h2>
          <p className="prose">{profile.bio || 'No bio provided.'}</p>
          {profile.experience ? (
            <>
              <h2 className="h2 section-gap">Experience</h2>
              <p className="prose">{profile.experience}</p>
            </>
          ) : null}
          {profile.education ? (
            <>
              <h2 className="h2 section-gap">Education</h2>
              <p className="prose">{profile.education}</p>
            </>
          ) : null}
        </section>

        <aside className="card">
          <h2 className="h2">Details</h2>
          <dl className="detail-list">
            <dt>Email</dt>
            <dd>{candidate.email}</dd>
            {profile.location ? (
              <>
                <dt>Location</dt>
                <dd>{profile.location}</dd>
              </>
            ) : null}
            {candidate.phone ? (
              <>
                <dt>Phone</dt>
                <dd>{candidate.phone}</dd>
              </>
            ) : null}
          </dl>
          {profile.skills?.length > 0 ? (
            <div className="tags section-gap">
              {profile.skills.map((skill) => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
