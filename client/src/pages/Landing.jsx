import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function Landing() {
  const { user, dashboardPath, loading } = useAuth()

  if (loading) return null

  if (user) {
    return <Navigate to={dashboardPath} replace />
  }

  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>

      {/* Background Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0) 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '700px',
        height: '700px',
        background: 'radial-gradient(circle, rgba(234, 179, 8, 0.12) 0%, rgba(234, 179, 8, 0) 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* Hero — grows to fill available space above marquee */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 20px',
        position: 'relative',
        zIndex: 1,
        minHeight: 0,
        marginTop: '-40px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'var(--panel)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          borderRadius: '999px',
          color: '#f97316',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(249, 115, 22, 0.15)',
          backdropFilter: 'blur(12px)',
        }}>
          ✨ A Brighter Way to Hire
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 64px)',
          maxWidth: '820px',
          margin: '0 0 16px 0',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          fontWeight: 700,
        }}>
          Connect top talent with{' '}
          <span style={{
            background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            world-class
          </span>{' '}
          opportunities.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 1.6vw, 18px)',
          maxWidth: '560px',
          margin: '0 0 28px 0',
          lineHeight: 1.6,
          color: 'var(--muted)',
        }}>
          A beautifully crafted hiring platform that brings candidates and recruiters together with real-time messaging, AI scoring, and a warm, intuitive experience.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn" style={{
            padding: '12px 28px',
            fontSize: '15px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4)',
            fontWeight: 700,
          }}>
            Get Started Free
          </Link>
          <Link to="/login" className="btn" style={{
            padding: '12px 28px',
            fontSize: '15px',
            borderRadius: '12px',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            fontWeight: 600,
            backdropFilter: 'blur(12px)',
          }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Trusted By Marquee — pinned to bottom */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
      <section style={{
        borderTop: '1px solid var(--border)',
        padding: '28px 0 32px',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(100px)',
      }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'var(--muted)',
          opacity: 0.5,
          textAlign: 'center',
          marginBottom: '60px',
        }}>
          Trusted by the next generation of startups
        </p>
        <div style={{
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}>
          <div style={{
            marginBottom: '40px',
            display: 'flex',
            gap: '64px',
            width: 'max-content',
            animation: 'marquee 25s linear infinite',
            alignItems: 'center',
            paddingLeft: '64px',
          }}>
            {[...Array(2)].flatMap((_, i) =>
              ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Quicko', 'Umbrella', 'Sarvam'].map(company => (
                <span key={`${i}-${company}`} style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  opacity: 0.7,
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '64px',
                }}>
                  {company}
                  <span style={{ opacity: 0.3, fontSize: '20px' }}>·</span>
                </span>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
