import { Link } from 'react-router-dom'

export function CandidateCard({ candidate }) {
  const id = candidate._id || candidate.id
  const skills = candidate.profile?.skills || []

  return (
    <Link to={`/candidates/${id}`} className="card list-card--link" style={{ textDecoration: 'none', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0 }}>
        {candidate.avatar ? (
          <img 
            src={candidate.avatar} 
            alt={candidate.name} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} 
          />
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(244, 63, 94, 0.1))', border: '1px solid var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '18px', color: 'var(--text)' }}>
            {candidate.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>{candidate.name}</h3>
        
        {candidate.profile?.headline ? (
          <p className="muted" style={{ margin: '0 0 6px', fontSize: '14px' }}>{candidate.profile.headline}</p>
        ) : null}
        
        {candidate.profile?.location ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--faint)', marginBottom: '12px' }}>
            <span>📍</span> {candidate.profile.location}
          </div>
        ) : null}
        
        {skills.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.slice(0, 6).map((skill) => (
              <span key={skill} className="nav__meta" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: '11px', padding: '4px 8px' }}>
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
        <span style={{ color: 'var(--primary)', fontSize: '20px' }}>→</span>
      </div>
    </Link>
  )
}
