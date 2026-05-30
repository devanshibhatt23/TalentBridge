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
        </div>
      </section>

      {/* Trusted By Marquee */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
      <section style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '32px 0',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'var(--muted)',
          opacity: 0.5,
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Trusted by the next generation of startups
        </p>
        <div style={{
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
        }}>
          <div style={{
            display: 'flex',
            gap: '48px',
            width: 'max-content',
            animation: 'marquee 20s linear infinite',
            alignItems: 'center'
          }}>
            {[...Array(2)].flatMap((_, i) =>
              ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella'].map(company => (
                <span key={`${i}-${company}`} style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  opacity: 0.7,
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '48px'
                }}>
                  {company}
                  <span style={{ opacity: 0.3, fontSize: '20px' }}>·</span>
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container" style={{ marginTop: '80px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: '0 0 12px 0'
          }}>
            Everything you need to hire better
          </h2>
          <p className="muted" style={{ fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
            Built for modern teams who move fast and care about candidate experience.
          </p>
        </div>
        <div className="grid grid--3">
          <div className="card" style={{ 
            padding: '36px 28px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderColor: 'rgba(249, 115, 22, 0.15)',
          }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '16px', 
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.15))', 
              border: '1px solid rgba(249, 115, 22, 0.25)',
              color: '#f97316',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.12)'
            }}>
              💬
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.2px' }}>Real-time Chat</h3>
            <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>Communicate instantly between candidates and recruiters with our beautiful, real-time messaging system.</p>
          </div>

          <div className="card" style={{ 
            padding: '36px 28px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderColor: 'rgba(234, 179, 8, 0.15)',
          }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '16px', 
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.15))', 
              border: '1px solid rgba(234, 179, 8, 0.25)',
              color: '#eab308',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(234, 179, 8, 0.12)'
            }}>
              📋
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.2px' }}>Kanban Tracking</h3>
            <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>Recruiters can easily drag and drop applications through a stunning Kanban board to manage the hiring pipeline.</p>
          </div>

          <div className="card" style={{ 
            padding: '36px 28px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderColor: 'rgba(249, 115, 22, 0.15)',
          }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '16px', 
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.15))', 
              border: '1px solid rgba(249, 115, 22, 0.25)',
              color: '#f97316',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.12)'
            }}>
              ✨
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.2px' }}>AI Match Scoring</h3>
            <p className="muted" style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>Automatically rank candidates using AI to find the perfect fit between a resume and job requirements.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
