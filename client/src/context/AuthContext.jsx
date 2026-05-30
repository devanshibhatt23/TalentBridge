import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearLegacySession,
  dashboardPathForRole,
  fetchMe,
  loginUser,
  registerUser,
  updateProfile as updateProfileApi,
  setStoredToken,
  getStoredToken,
} from '../services/api.js'
import { connectSocket, disconnectSocket } from '../socket.js'

const AuthContext = createContext(null)

function normalizeUser(raw) {
  if (!raw) return null
  return {
    id: raw.id || raw._id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    phone: raw.phone,
    company: raw.company,
    profile: raw.profile,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSession = useCallback(async () => {
    clearLegacySession()
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const res = await fetchMe()
      setUser(normalizeUser(res.data?.user))
      setError(null)
    } catch {
      setStoredToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  useEffect(() => {
    if (user) connectSocket()
    else disconnectSocket()
  }, [user])

  const login = useCallback(async ({ email, password }) => {
    setError(null)
    const res = await loginUser({ email, password })
    const { token, user: loggedInUser } = res.data
    setStoredToken(token)
    const normalized = normalizeUser(loggedInUser)
    setUser(normalized)
    return normalized
  }, [])

  const register = useCallback(async (payload) => {
    setError(null)
    const res = await registerUser(payload)
    const { token, user: newUser } = res.data
    setStoredToken(token)
    const normalized = normalizeUser(newUser)
    setUser(normalized)
    return normalized
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    setUser(null)
    setError(null)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    setError(null)
    const res = await updateProfileApi(payload)
    const normalized = normalizeUser(res.data?.user)
    setUser(normalized)
    return normalized
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      setError,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      refreshUser: loadSession,
      dashboardPath: user ? dashboardPathForRole(user.role) : '/login',
    }),
    [user, loading, error, login, register, logout, updateProfile, loadSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
