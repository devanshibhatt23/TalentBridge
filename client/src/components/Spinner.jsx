import React from 'react'

export function Spinner({ size = '32px', color = 'var(--primary)', message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px 0' }}>
      <div 
        style={{
          width: size,
          height: size,
          border: `3px solid ${color}`,
          borderBottomColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          boxSizing: 'border-box',
          animation: 'rotation 1s linear infinite'
        }}
      />
      {message && <p className="muted" style={{ margin: 0, fontSize: '14px' }}>{message}</p>}
      <style>{`
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
