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

  useEffect(() => {
    console.log('[NotificationContext] useEffect fired, user:', user?.id, user?.email)
    if (!user) {
      console.log('[NotificationContext] No user, clearing state')
      setTotalUnread(0)
      setToasts([])
      return
    }

    const s = connectSocket()
    socketRef.current = s
    console.log('[NotificationContext] Socket obtained, connected:', s.connected, 'id:', s.id)
    console.log('[NotificationContext] Registering message:new listener')
    console.log('[NotificationContext] Current listeners for message:new:', s.listeners('message:new').length)

    function onGlobalMessage(msg) {
      console.log('[NotificationContext] ✉️ message:new received!', {
        conversationId: msg?.conversationId,
        senderId: msg?.sender?.id,
        senderName: msg?.sender?.name,
        content: msg?.content?.slice(0, 50),
        activeConversation: activeConversationRef.current,
        currentUserId: user?.id,
      })

      // Don't notify for own messages (check this first!)
      if (msg?.sender?.id === user?.id) {
        console.log('[NotificationContext] ⏭️ Skipped: own message')
        return
      }

      // If the user is currently viewing this conversation AND the browser tab is focused, skip notification
      if (msg?.conversationId === activeConversationRef.current && !document.hidden) {
        console.log('[NotificationContext] ⏭️ Skipped: user is viewing this conversation and tab is active')
        return
      }

      console.log('[NotificationContext] ✅ Incrementing unread count and showing toast')

      // Increment total unread count
      setTotalUnread((prev) => {
        console.log('[NotificationContext] totalUnread:', prev, '->', prev + 1)
        return prev + 1
      })

      // Add a toast
      const toastId = `${Date.now()}-${Math.random()}`
      const senderName = msg?.sender?.name || msg?.sender?.email || 'Someone'
      const preview = msg?.content?.length > 80
        ? msg.content.slice(0, 80) + '…'
        : msg?.content || ''

      console.log('[NotificationContext] 🍞 Adding toast:', { toastId, senderName, preview })

      setToasts((prev) => {
        const next = [
          ...prev,
          { id: toastId, senderName, preview, conversationId: msg?.conversationId },
        ]
        console.log('[NotificationContext] Toasts now:', next.length)
        return next
      })

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        console.log('[NotificationContext] ⏰ Auto-dismissing toast:', toastId)
        setToasts((prev) => prev.filter((t) => t.id !== toastId))
      }, 3000)
    }

    s.on('message:new', onGlobalMessage)
    console.log('[NotificationContext] Listener registered. Total message:new listeners now:', s.listeners('message:new').length)

    return () => {
      console.log('[NotificationContext] Cleanup: removing listener')
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
    }),
    [totalUnread, toasts, setActiveConversation, clearUnread, resetUnread, dismissToast],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
