import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function Landing() {
  const { user, dashboardPath, loading } = useAuth()

  if (loading) return null

  // If user is already logged in, redirect them to dashboard
  if (user) {
    return <Navigate to={dashboardPath} replace />
  }

  return (
    <div className="landing-page" style={{ paddingBottom: '100px', overflow: 'hidden' }}>
      
      {/* Background Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0) 70%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '700px',
        height: '700px',
        background: 'radial-gradient(circle, rgba(234, 179, 8, 0.12) 0%, rgba(234, 179, 8, 0) 70%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      {/* Hero Section */}
      <section 
        className="hero" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '100px 20px 60px',
          position: 'relative'
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          background: 'var(--panel)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          borderRadius: '999px',
          color: '#f97316',
          fontSize: '14px',
          fontWeight: 700,
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(249, 115, 22, 0.15)',
          backdropFilter: 'blur(12px)'
        }}>
          ✨ A Brighter Way to Hire
        </div>
        
        <h1 className="h1" style={{ 
          fontSize: 'clamp(48px, 6vw, 72px)', 
          maxWidth: '900px', 
          margin: '0 0 24px 0', 
          lineHeight: 1.1, 
          letterSpacing: '-0.03em',
          position: 'relative',
          zIndex: 1
        }}>
          Connect top talent with <br/>
          <span style={{ 
            background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 40px rgba(249, 115, 22, 0.3)'
          }}>
            world-class
          </span> opportunities.
        </h1>
        
        <p className="muted" style={{ 
          fontSize: 'clamp(18px, 2vw, 22px)', 
          maxWidth: '650px', 
          margin: '0 0 48px 0', 
          lineHeight: 1.6 
        }}>
          A beautifully crafted hiring platform that brings candidates and recruiters together with real-time messaging, AI scoring, and a warm, intuitive experience.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <Link to="/register" className="btn" style={{ 
            padding: '16px 36px', 
            fontSize: '18px', 
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4)',
            fontWeight: 700
          }}>
            Get Started Free
          </Link>
          {/* <Link to="/jobs" className="btn btn--ghost" style={{ 
            padding: '16px 36px', 
            fontSize: '18px', 
            borderRadius: '12px', 
            background: 'var(--panel-strong)', 
            border: '1px solid var(--border)',
            fontWeight: 600
          }}>
            Browse Jobs
          </Link> */}
        </div>

        {/* Trusted By Banner */}
        <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)', width: '100%', maxWidth: '800px' }}>
          <p className="faint" style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>
            Trusted by the next generation of startups
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, flexWrap: 'wrap', gap: '32px' }}>
            {['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella'].map(company => (
              <span key={company} style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--muted)' }}>
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container" style={{ marginTop: '60px', position: 'relative', zIndex: 1 }}>
        <div className="grid grid--3">
          <div className="card" style={{ 
            padding: '40px 10px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderColor: 'rgba(249, 115, 22, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '20px', 
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.15))', 
              border: '1px solid rgba(249, 115, 22, 0.2)',
              color: '#f97316',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.1)'
            }}>
              💬
            </div>
            <h3 className="h2" style={{ fontSize: '20px', marginBottom: '12px' }}>Real-time Chat</h3>
            <p className="muted" style={{ margin: 0 }}>Communicate instantly between candidates and recruiters with our beautiful, real-time messaging system.</p>
          </div>

          <div className="card" style={{ 
            padding: '40px 32px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderColor: 'rgba(234, 179, 8, 0.1)'
          }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '20px', 
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.15))', 
              border: '1px solid rgba(234, 179, 8, 0.2)',
              color: '#eab308',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(234, 179, 8, 0.1)'
            }}>
              📋
            </div>
            <h3 className="h2" style={{ fontSize: '20px', marginBottom: '12px' }}>Kanban Tracking</h3>
            <p className="muted" style={{ margin: 0 }}>Recruiters can easily drag and drop applications through a stunning Kanban board to manage the hiring pipeline.</p>
          </div>

          <div className="card" style={{ 
            padding: '40px 32px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderColor: 'rgba(249, 115, 22, 0.1)'
          }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '20px', 
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.15))', 
              border: '1px solid rgba(249, 115, 22, 0.2)',
              color: '#f97316',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.1)'
            }}>
              ✨
            </div>
            <h3 className="h2" style={{ fontSize: '20px', marginBottom: '12px' }}>AI Match Scoring</h3>
            <p className="muted" style={{ margin: 0 }}>Automatically rank candidates using AI to find the perfect fit between a resume and job requirements.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
