import { Link } from 'react-router-dom'

export function CandidateCard({ candidate }) {
  const id = candidate._id || candidate.id
  const skills = candidate.profile?.skills || []

  return (
    <article className="card list-card">
      <h3 className="list-card__title">
        <Link to={`/candidates/${id}`}>{candidate.name}</Link>
      </h3>
      {candidate.profile?.headline ? (
        <p className="muted">{candidate.profile.headline}</p>
      ) : null}
      {candidate.profile?.location ? (
        <p className="list-card__meta">{candidate.profile.location}</p>
      ) : null}
      {skills.length > 0 ? (
        <div className="tags">
          {skills.slice(0, 6).map((skill) => (
            <span key={skill} className="tag">
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}
