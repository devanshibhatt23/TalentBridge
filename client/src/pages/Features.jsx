import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '💬',
    title: 'Real-time Chat',
    desc: 'Communicate instantly between candidates and recruiters with our beautiful, real-time messaging system. Built on WebSocket technology for zero-latency conversations.',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.25)',
  },
  {
    icon: '📋',
    title: 'Kanban Tracking',
    desc: 'Drag and drop applications through a visual Kanban board to manage your entire hiring pipeline. Track candidates from application to offer with ease.',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.12)',
    border: 'rgba(234, 179, 8, 0.25)',
  },
  {
    icon: '✨',
    title: 'AI Match Scoring',
    desc: 'Automatically rank candidates using AI to find the perfect fit between a resume and job requirements. Save hours of manual screening.',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.25)',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    desc: 'Stay updated with real-time notifications for new applications, messages, and status changes. Never miss an important update.',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.25)',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Track your hiring metrics with beautiful charts and insights. Understand your pipeline performance at a glance.',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  {
    icon: '🎯',
    title: 'Role-based Access',
    desc: 'Separate candidate and recruiter experiences with tailored dashboards and workflows for each user type.',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.25)',
  },
]

export function Features() {
  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 18px',
            background: 'var(--panel)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            borderRadius: '999px',
            color: '#f97316',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.15)',
            backdropFilter: 'blur(12px)',
          }}>
            ✨ Platform Features
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: '0 0 16px 0',
          }}>
            Everything you need to hire better
          </h1>
          <p className="muted" style={{
            fontSize: 'clamp(16px, 1.5vw, 18px)',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Built for modern teams who move fast and care about candidate experience. Our platform combines powerful automation with human-centered design.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid--3" style={{ marginBottom: '60px' }}>
          {FEATURES.map(feature => (
            <div
              key={feature.title}
              className="card"
              style={{
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderColor: feature.border,
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: feature.bg,
                border: `1px solid ${feature.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                flexShrink: 0,
                boxShadow: `0 8px 24px ${feature.bg}`,
              }}>
                {feature.icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.2px',
                }}>
                  {feature.title}
                </h3>
                <p className="muted" style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: 1.6,
                }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{
          textAlign: 'center',
          padding: '48px 32px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(234, 179, 8, 0.08))',
          border: '1px solid rgba(249, 115, 22, 0.2)',
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 700,
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em',
          }}>
            Ready to transform your hiring?
          </h2>
          <p className="muted" style={{
            fontSize: '16px',
            margin: '0 0 28px 0',
            maxWidth: '480px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Join hundreds of companies already using TalentBridge to find and hire top talent.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn" style={{
              padding: '13px 30px',
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
            <Link to="/" className="btn" style={{
              padding: '13px 30px',
              fontSize: '15px',
              borderRadius: '12px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              fontWeight: 600,
              backdropFilter: 'blur(12px)',
            }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
