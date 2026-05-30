import { useNotifications } from '../context/NotificationContext.jsx'

export function ToastContainer() {
  const { toasts, dismissToast } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast" role="status">
          <div className="toast__icon">💬</div>
          <div className="toast__body">
            <div className="toast__sender">{t.senderName}</div>
            <div className="toast__preview">{t.preview}</div>
          </div>
          <button
            className="toast__close"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
