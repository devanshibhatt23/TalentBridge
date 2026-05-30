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
    <div className="landing-page" style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section 
        className="hero" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '120px 20px 80px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(3,7,18,0) 70%)',
            zIndex: -1,
            pointerEvents: 'none'
          }}
        />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '999px',
          color: 'var(--primary)',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          ✨ The new standard in hiring
        </div>
        
        <h1 className="h1" style={{ fontSize: '64px', maxWidth: '800px', margin: '0 0 24px 0', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Connect top talent with <span style={{ color: 'var(--primary)', textShadow: '0 0 40px rgba(139,92,246,0.4)' }}>world-class</span> opportunities.
        </h1>
        
        <p className="muted" style={{ fontSize: '20px', maxWidth: '600px', margin: '0 0 48px 0', lineHeight: 1.6 }}>
          A sleek, modern hiring platform that brings candidates and recruiters together with real-time messaging, AI match scoring, and a beautiful kanban experience.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn--primary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '12px' }}>
            Get Started
          </Link>
          <Link to="/jobs" className="btn btn--ghost" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '12px', background: 'var(--panel)', border: '1px solid var(--border)' }}>
            Browse Jobs
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container" style={{ marginTop: '40px' }}>
        <div className="grid grid--3">
          <div className="card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--panel-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-glow)' }}>
              💬
            </div>
            <h3 className="h2" style={{ fontSize: '20px', marginBottom: '12px' }}>Real-time Chat</h3>
            <p className="muted" style={{ margin: 0 }}>Communicate instantly between candidates and recruiters with our beautiful, real-time messaging system.</p>
          </div>

          <div className="card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--panel-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-glow)' }}>
              📋
            </div>
            <h3 className="h2" style={{ fontSize: '20px', marginBottom: '12px' }}>Kanban Tracking</h3>
            <p className="muted" style={{ margin: 0 }}>Recruiters can easily drag and drop applications through a stunning Kanban board to manage the hiring pipeline.</p>
          </div>

          <div className="card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--panel-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-glow)' }}>
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
