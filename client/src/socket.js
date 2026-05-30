import { io } from 'socket.io-client'
import { getStoredToken } from './services/api.js'

let socket = null

function socketUrl() {
  // If VITE_SOCKET_URL is set, use it.
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL

  const apiUrl = import.meta.env.VITE_API_URL || ''
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '')
  }

  return window.location.origin
}

export function getSocket() {
  if (socket) return socket

  socket = io(socketUrl(), {
    autoConnect: false,
    transports: ['websocket'],
    auth: {
      token: getStoredToken(),
    },
  })

  return socket
}

export function connectSocket() {
  const s = getSocket()
  s.auth = { token: getStoredToken() }
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  if (socket) socket.disconnect()
}

