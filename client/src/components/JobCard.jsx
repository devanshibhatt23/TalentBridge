import { StatusBadge } from './StatusBadge.jsx'
import { Link } from 'react-router-dom'

export function JobCard({ job }) {
  const id = job._id || job.id
  return (
    <Link to={`/jobs/${id}`} className="card list-card list-card--link">
      <div className="list-card__top">
        <div>
          <h3 className="list-card__title">{job.title}</h3>
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
    </Link>
  )
}
