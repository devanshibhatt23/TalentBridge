import { useEffect, useState } from 'react'
import { CandidateCard } from '../components/CandidateCard.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { Alert } from '../components/Alert.jsx'
import { searchCandidates } from '../services/api.js'

export function Candidates() {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await searchCandidates({
        keyword: keyword || undefined,
        location: location || undefined,
      })
      setCandidates(res.data?.candidates || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="container page">
      <div className="page__header">
        <h1 className="h1">Search candidates</h1>
        <p className="muted">Find talent by keyword, skills, or location.</p>
      </div>

      <div className="card filters">
        <SearchBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSubmit={load}
          placeholder="Name, headline, skills…"
        >
          <input
            className="input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
          />
        </SearchBar>
      </div>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <p className="muted">Loading candidates…</p>
      ) : candidates.length === 0 ? (
        <p className="muted">No candidates match your search.</p>
      ) : (
        <div className="stack">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate._id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  )
}
