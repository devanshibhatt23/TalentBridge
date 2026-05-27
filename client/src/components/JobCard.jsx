import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge.jsx'

export function JobCard({ job }) {
  const id = job._id || job.id
  return (
    <article className="card list-card">
      <div className="list-card__top">
        <div>
          <h3 className="list-card__title">
            <Link to={`/jobs/${id}`}>{job.title}</Link>
          </h3>
          <p className="muted list-card__meta">
            {job.company} · {job.location} · {job.jobType}
          </p>
        </div>
        <StatusBadge status={job.status || 'open'} />
      </div>
      {job.salary ? <p className="list-card__salary">{job.salary}</p> : null}
      {job.skills?.length > 0 ? (
        <div className="tags">
          {job.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="tag">
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}
