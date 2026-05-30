import axios from 'axios'
import apiMap from '../api.json'

const TOKEN_KEY = 'tb_token'

export const apiConfig = apiMap

const rawBaseUrl = apiMap.baseUrl
const normalizedBaseUrl = rawBaseUrl.endsWith(apiMap.baseUrl)
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, '')}${apiMap.baseUrl}`

export const api = axios.create({
  baseURL: normalizedBaseUrl,
})

const cache = new Map()
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

export function clearApiCache() {
  cache.clear()
}

export function readApiCache(group, name, params = {}) {
  try {
    const url = endpointPath(group, name, params)
    const key = url + JSON.stringify(params)
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
  } catch (e) {
    // ignore
  }
  return null
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.method?.toLowerCase() !== 'get') {
    // If it's a POST/PUT/DELETE, clear cache to ensure fresh data
    console.log('[API] Clearing cache due to mutation:', config.method, config.url)
    cache.clear()
  }

  return config
})

// Override api.get to implement robust in-memory caching
const originalGet = api.get
api.get = async function (url, config = {}) {
  const key = url + JSON.stringify(config.params || {})
  const cached = cache.get(key)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[API] Cache HIT:', key)
    return Promise.resolve({ data: cached.data, status: 200, statusText: 'OK', config })
  }

  console.log('[API] Cache MISS:', key)
  const response = await originalGet.call(api, url, config)
  cache.set(key, { data: response.data, timestamp: Date.now() })
  return response
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('[API ERROR]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  },
)

function pathWithParams(template, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
    template,
  )
}

function endpointPath(group, name, params) {
  const entry = apiMap.endpoints[group]?.[name]
  if (!entry) throw new Error(`Unknown endpoint: ${group}.${name}`)
  return pathWithParams(entry.path, params)
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function clearLegacySession() {
  localStorage.removeItem('tb_role')
  localStorage.removeItem('tb_email')
  localStorage.removeItem('tb_name')
}

// --- Health ---
export async function checkHealth() {
  const { data } = await api.get(apiMap.endpoints.health.path)
  return data
}

// --- Auth ---
export async function registerUser(payload) {
  const { data } = await api.post(endpointPath('auth', 'register'), payload)
  return data
}

export async function loginUser(payload) {
  const { data } = await api.post(endpointPath('auth', 'login'), payload)
  return data
}

export async function fetchMe() {
  const { data } = await api.get(endpointPath('auth', 'me'))
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put(endpointPath('auth', 'profile'), payload)
  return data
}

export async function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  const { data } = await api.put(endpointPath('auth', 'avatar'), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// --- Jobs ---
export async function fetchJobs(params) {
  const { data } = await api.get(endpointPath('jobs', 'list'), { params })
  return data
}

export async function fetchJobById(id) {
  const { data } = await api.get(endpointPath('jobs', 'getById', { id }))
  return data
}

export async function fetchMyJobs() {
  const { data } = await api.get(endpointPath('jobs', 'myJobs'))
  return data
}

export async function createJob(payload) {
  const { data } = await api.post(endpointPath('jobs', 'create'), payload)
  return data
}

export async function updateJob(id, payload) {
  const { data } = await api.put(endpointPath('jobs', 'update', { id }), payload)
  return data
}

export async function deleteJob(id) {
  const { data } = await api.delete(endpointPath('jobs', 'delete', { id }))
  return data
}

// --- Applications ---
export async function applyToJob(payload) {
  const { data } = await api.post(endpointPath('applications', 'apply'), payload)
  return data
}

export async function downloadResume(applicationId) {
  const { data } = await api.get(endpointPath('applications', 'downloadResume', { id: applicationId }), {
    responseType: 'blob',
  })
  return data
}

export async function fetchMyApplications() {
  const { data } = await api.get(endpointPath('applications', 'myApplications'))
  return data
}

export async function fetchJobApplications(jobId) {
  const { data } = await api.get(
    endpointPath('applications', 'jobApplications', { jobId }),
  )
  return data
}

export async function updateApplicationStatus(id, payload) {
  const { data } = await api.put(
    endpointPath('applications', 'updateStatus', { id }),
    payload,
  )
  return data
}

export async function getResumeInfo(applicationId) {
  const { data } = await api.get(endpointPath('applications', 'resumeInfo', { id: applicationId }))
  return data
}

export async function updateResume(applicationId, file) {
  const formData = new FormData()
  formData.append('resume', file)
  const { data } = await api.put(
    endpointPath('applications', 'updateResume', { id: applicationId }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

// --- Candidates ---
export async function searchCandidates(params) {
  const { data } = await api.get(endpointPath('candidates', 'search'), { params })
  return data
}

export async function fetchCandidateById(id) {
  const { data } = await api.get(endpointPath('candidates', 'getById', { id }))
  return data
}

// --- Conversations ---
export async function fetchConversations() {
  const { data } = await api.get(endpointPath('conversations', 'list'))
  return data
}

export async function getOrCreateConversation(participantId) {
  const { data } = await api.post(endpointPath('conversations', 'getOrCreate'), { participantId })
  return data
}

export async function fetchConversationMessages(id) {
  const { data } = await api.get(endpointPath('conversations', 'messages', { id }))
  return data
}

// --- Users ---
export async function searchUsers(params) {
  const { data } = await api.get(endpointPath('users', 'search'), { params })
  return data
}

export function dashboardPathForRole(role) {
  return role === 'recruiter' ? '/recruiter-dashboard' : '/candidate-dashboard'
}
