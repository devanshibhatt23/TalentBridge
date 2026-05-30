// ============================================
// Shared Formatting Utilities
// ============================================
// Single source of truth for display formatting
// across the entire TalentBridge frontend.
// ============================================

const JOB_TYPE_LABELS = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  internship: 'Internship',
  contract: 'Contract',
  remote: 'Remote',
}

/**
 * Convert a stored job type value to a display label.
 * e.g. "full-time" → "Full-Time"
 */
export function formatJobType(type) {
  if (!type) return ''
  return JOB_TYPE_LABELS[type.toLowerCase()] || type
}

/**
 * Capitalize the first letter of a status string.
 * e.g. "applied" → "Applied", "interviewing" → "Interviewing"
 */
export function formatStatus(status) {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1)
}

/**
 * Format an ISO date string into a readable date.
 * e.g. "2026-05-30T10:00:00Z" → "May 30, 2026"
 */
export function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Format an ISO date string into a relative time string.
 * e.g. "2 days ago", "Just now", "3 hours ago"
 */
export function formatRelativeTime(iso) {
  if (!iso) return ''
  try {
    const now = Date.now()
    const date = new Date(iso).getTime()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffSec < 60) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`
    return formatDate(iso)
  } catch {
    return ''
  }
}

/**
 * Format bytes into a human-readable file size.
 * e.g. 204850 → "200 KB"
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format an ISO timestamp into a short time string for chat.
 * e.g. "5/30/2026, 3:45 PM"
 */
export function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return ''
  }
}
