import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { connectSocket } from '../socket.js'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [totalUnread, setTotalUnread] = useState(0)
  const [toasts, setToasts] = useState([])
  const socketRef = useRef(null)
  // Track whether the user is currently on the messages page viewing a specific conversation
  const activeConversationRef = useRef(null)

  const setActiveConversation = useCallback((id) => {
    activeConversationRef.current = id
  }, [])

  const clearUnread = useCallback((count = 0) => {
    setTotalUnread((prev) => Math.max(0, prev - count))
  }, [])

  const resetUnread = useCallback(() => {
    setTotalUnread(0)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type, title, preview) => {
    const toastId = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [
      ...prev,
      { id: toastId, type, senderName: title, preview },
    ])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
    }, 3000)
  }, [])

  useEffect(() => {
    if (!user) {
      setTotalUnread(0)
      setToasts([])
      return
    }

    const s = connectSocket()
    socketRef.current = s

    function onGlobalMessage(msg) {
      // Don't notify for own messages (check this first!)
      if (msg?.sender?.id === user?.id) {
        return
      }

      // If the user is currently viewing this conversation AND the browser tab is focused, skip notification
      if (msg?.conversationId === activeConversationRef.current && !document.hidden) {
        return
      }

      // Increment total unread count
      setTotalUnread((prev) => prev + 1)

      // Add a toast
      const toastId = `${Date.now()}-${Math.random()}`
      const senderName = msg?.sender?.name || msg?.sender?.email || 'Someone'
      const preview = msg?.content?.length > 80
        ? msg.content.slice(0, 80) + '…'
        : msg?.content || ''

      setToasts((prev) => {
        return [
          ...prev,
          { id: toastId, type: 'message', senderName, preview, conversationId: msg?.conversationId },
        ]
      })

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId))
      }, 5000)
    }

    s.on('message:new', onGlobalMessage)

    return () => {
      s.off('message:new', onGlobalMessage)
    }
  }, [user])

  const value = useMemo(
    () => ({
      totalUnread,
      toasts,
      setActiveConversation,
      clearUnread,
      resetUnread,
      dismissToast,
      addToast,
    }),
    [totalUnread, toasts, setActiveConversation, clearUnread, resetUnread, dismissToast, addToast],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
