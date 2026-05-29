import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchConversationMessages,
  fetchConversations,
  getOrCreateConversation,
  searchUsers,
} from '../services/api.js'
import { connectSocket } from '../socket.js'

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return ''
  }
}

function messageBadge(type) {
  if (type === 'oa_link') return 'OA'
  if (type === 'interview_link') return 'Interview'
  return null
}

export function Messages() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [compose, setCompose] = useState('')
  const [composeType, setComposeType] = useState('text')
  
  // New search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchRole, setSearchRole] = useState('')
  const [searchCompany, setSearchCompany] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  const [error, setError] = useState(null)

  const socketRef = useRef(null)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId],
  )

  async function loadConversations(selectFirst = true) {
    const res = await fetchConversations()
    const list = res.data?.conversations || []
    setConversations(list)
    if (selectFirst && !activeId && list.length) setActiveId(list[0].id)
  }

  async function loadMessages(conversationId) {
    if (!conversationId) {
      setMessages([])
      return
    }
    const res = await fetchConversationMessages(conversationId)
    setMessages(res.data?.messages || [])
  }

  async function handleSearch() {
    if (!searchQuery.trim() && !searchRole && !searchCompany) {
      setSearchResults([])
      return
    }

    try {
      setSearchLoading(true)
      setError(null)
      const res = await searchUsers({
        keyword: searchQuery,
        role: searchRole,
        company: searchCompany,
        limit: 20,
      })
      setSearchResults(res.data?.users || [])
      setShowSearchResults(true)
    } catch (e) {
      setError(e.message || 'Failed to search users.')
    } finally {
      setSearchLoading(false)
    }
  }

  async function handleSelectUser(selectedUser) {
    try {
      setError(null)
      const res = await getOrCreateConversation(selectedUser.id)
      const convo = res.data?.conversation
      if (convo) {
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === convo.id)
          const next = exists ? prev : [convo, ...prev]
          return next
        })
        setActiveId(convo.id)
        setSearchQuery('')
        setSearchRole('')
        setSearchCompany('')
        setSearchResults([])
        setShowSearchResults(false)
      }
    } catch (e2) {
      setError(e2.message || 'Failed to start chat.')
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        await loadConversations(true)
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load conversations.')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setError(null)
        await loadMessages(activeId)
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load messages.')
      }
    })()
    return () => {
      mounted = false
    }
  }, [activeId])

  useEffect(() => {
    const s = connectSocket()
    socketRef.current = s

    function onMessageNew(msg) {
      if (msg?.conversationId !== activeId) return
      setMessages((prev) => [...prev, msg])
    }

    function onConversationUpdated(update) {
      const { conversationId, lastMessage, lastMessageAt } = update || {}
      if (!conversationId) return
      setConversations((prev) => {
        const next = [...prev]
        const idx = next.findIndex((c) => c.id === conversationId)
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            lastMessage: lastMessage || next[idx].lastMessage,
            lastMessageAt: lastMessageAt || next[idx].lastMessageAt,
          }
          next.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
          return next
        }
        return next
      })
    }

    s.on('message:new', onMessageNew)
    s.on('conversation:updated', onConversationUpdated)

    return () => {
      s.off('message:new', onMessageNew)
      s.off('conversation:updated', onConversationUpdated)
    }
  }, [activeId])

  useEffect(() => {
    const s = socketRef.current
    if (!s || !activeId) return
    s.emit('conversation:join', { conversationId: activeId })
    return () => {
      s.emit('conversation:leave', { conversationId: activeId })
    }
  }, [activeId])

  async function onSend(e) {
    e.preventDefault()
    const s = socketRef.current
    if (!s || !activeId) return
    const content = compose.trim()
    if (!content) return

    setCompose('')
    s.emit(
      'message:send',
      { conversationId: activeId, content, messageType: composeType },
      (ack) => {
        if (!ack?.ok) setError(ack?.error || 'Failed to send message.')
      },
    )
  }

  return (
    <div className="container">
      <div className="pagehead">
        <h1>Messages</h1>
        <p className="muted">
          Real-time communication hub for updates and sharing OA/Interview links.
        </p>
      </div>

      {error ? (
        <div className="alert alert--danger" role="alert">
          {error}
        </div>
      ) : null}

      <div className="chat">
        <aside className="chat__sidebar">
          <div className="chat__start">
            <label className="label">Search users to start a chat</label>
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                className="input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name or email…"
                style={{ marginBottom: '0.5rem' }}
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select
                  className="input"
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  aria-label="Filter by role"
                >
                  <option value="">All roles</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="candidate">Candidate</option>
                </select>

                <input
                  className="input"
                  type="text"
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  placeholder="Filter by company…"
                  aria-label="Filter by company"
                />
              </div>

              <button 
                className="btn btn--primary" 
                onClick={handleSearch}
                disabled={searchLoading}
                style={{ width: '100%' }}
              >
                {searchLoading ? 'Searching…' : 'Search'}
              </button>
            </div>

            {showSearchResults && (
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                maxHeight: '300px',
                overflowY: 'auto',
                marginBottom: '1rem'
              }}>
                {searchResults.length === 0 ? (
                  <div className="muted" style={{ padding: '0.5rem' }}>No users found</div>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.75rem',
                        marginBottom: '0.25rem',
                        textAlign: 'left',
                        border: '1px solid var(--color-border)',
                        borderRadius: '0.25rem',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-surface-hover)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        {u.email}
                        {u.role && ` • ${u.role}`}
                        {u.company && ` • ${u.company}`}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="chat__list" aria-label="Conversation list">
            {loading ? <div className="muted">Loading…</div> : null}
            {!loading && conversations.length === 0 ? (
              <div className="muted">No conversations yet.</div>
            ) : null}
            {conversations.map((c) => (
              <button
                key={c.id}
                className={`chat__item ${c.id === activeId ? 'is-active' : ''}`}
                onClick={() => setActiveId(c.id)}
                type="button"
              >
                <div className="chat__itemTitle">{c.otherUser?.name || c.otherUser?.email}</div>
                <div className="chat__itemSub muted">
                  {c.lastMessage
                    ? `${messageBadge(c.lastMessage.messageType) ? `[${messageBadge(c.lastMessage.messageType)}] ` : ''}${c.lastMessage.content}`
                    : 'No messages yet'}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="chat__main" aria-label="Chat window">
          {!activeConversation ? (
            <div className="muted">Select a conversation to start messaging.</div>
          ) : (
            <>
              <div className="chat__header">
                <div>
                  <div className="chat__title">
                    {activeConversation.otherUser?.name || activeConversation.otherUser?.email}
                  </div>
                  <div className="muted small">You are logged in as {user?.email}</div>
                </div>
              </div>

              <div className="chat__messages">
                {messages.map((m) => {
                  const mine = m.sender?.id === user?.id
                  const badge = messageBadge(m.messageType)
                  return (
                    <div key={m.id} className={`msg ${mine ? 'msg--mine' : 'msg--theirs'}`}>
                      <div className="msg__meta muted small">
                        {mine ? 'You' : m.sender?.name || m.sender?.email}
                        {badge ? <span className="msg__badge">{badge}</span> : null}
                        <span className="msg__time">{formatTime(m.createdAt)}</span>
                      </div>
                      <div className="msg__body">{m.content}</div>
                    </div>
                  )
                })}
              </div>

              <form className="chat__composer" onSubmit={onSend}>
                <select
                  className="input"
                  value={composeType}
                  onChange={(e) => setComposeType(e.target.value)}
                  aria-label="Message type"
                >
                  <option value="text">Text</option>
                  <option value="oa_link">OA link</option>
                  <option value="interview_link">Interview link</option>
                </select>
                <input
                  className="input"
                  value={compose}
                  onChange={(e) => setCompose(e.target.value)}
                  placeholder="Type a message or paste a link…"
                />
                <button className="btn btn--primary" type="submit">
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

