const STATUS_CLASS = {
  applied: 'status--applied',
  screening: 'status--screening',
  interviewing: 'status--interviewing',
  offered: 'status--offered',
  hired: 'status--hired',
  rejected: 'status--rejected',
  withdrawn: 'status--withdrawn',
  open: 'status--open',
  closed: 'status--closed',
}

export function StatusBadge({ status }) {
  const key = status?.toLowerCase()
  const cls = STATUS_CLASS[key] || 'status--default'
  return <span className={`status ${cls}`}>{status}</span>
}
