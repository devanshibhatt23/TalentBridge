import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext.jsx'

export function ToastContainer() {
  const { toasts, dismissToast } = useNotifications()
  const navigate = useNavigate()

  if (toasts.length === 0) return null

  function handleToastClick(t) {
    if (t.type === 'message' && t.conversationId) {
      navigate('/messages')
    }
    dismissToast(t.id)
  }

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => {
        const typeClass = t.type ? `toast--${t.type}` : 'toast--message'
        
        return (
          <div 
            key={t.id} 
            className={`toast ${typeClass}`} 
            role="status"
            onClick={() => handleToastClick(t)}
          >
            <div className="toast__icon">💬</div>
            <div className="toast__body">
              <div className="toast__sender">{t.senderName}</div>
              <div className="toast__preview">{t.preview}</div>
            </div>
            <button
              className="toast__close"
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(t.id)
              }}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
            <div className="toast__progress"></div>
          </div>
        )
      })}
    </div>
  )
}
