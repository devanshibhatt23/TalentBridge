import { useEffect, useState } from 'react'
import { JobCard } from '../components/JobCard.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { Alert } from '../components/Alert.jsx'
import { Spinner } from '../components/Spinner.jsx'
import { fetchJobs, readApiCache } from '../services/api.js'
import { formatJobType } from '../utils/formatters.js'
import apiMap from '../api.json'

export function Jobs() {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const defaultParams = { page: 1, limit: 10 }
  const [jobs, setJobs] = useState(() => readApiCache('jobs', 'list', defaultParams)?.data?.jobs || [])
  const [pagination, setPagination] = useState(() => readApiCache('jobs', 'list', defaultParams)?.data?.pagination || null)
  const [loading, setLoading] = useState(() => !readApiCache('jobs', 'list', defaultParams))
  const [error, setError] = useState('')

  async function load(page = 1) {
    const params = {
      keyword: keyword || undefined,
      location: location || undefined,
      jobType: jobType || undefined,
      page,
      limit: 10,
    }
    
    if (!readApiCache('jobs', 'list', params)) {
      setLoading(true)
    }
    setError('')
    try {
      const res = await fetchJobs(params)
      setJobs(res.data?.jobs || [])
      setPagination(res.data?.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      // Re-load when filters change, reset to page 1
      load(1)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [keyword, location, jobType])

  return (
    <div className="container page">
      <div className="page__header">
        <div>
          <h1 className="h1">Browse jobs</h1>
          <p className="muted">Search open roles with keyword and filters.</p>
        </div>
      </div>

      <div className="card filters">
        <SearchBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          placeholder="Keyword (title, skills, company…)"
        >
          <input
            className="input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
          />
          <select
            className="input"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">All types</option>
            {apiMap.jobTypes.map((type) => (
              <option key={type} value={type}>
                {formatJobType(type)}
              </option>
            ))}
          </select>
        </SearchBar>
      </div>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <Spinner message="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <p className="muted">No jobs found. Try different filters.</p>
      ) : (
        <div className="stack">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <p className="muted page__footer">
          Page {pagination.currentPage} of {pagination.totalPages} ·{' '}
          {pagination.totalJobs} jobs
        </p>
      ) : null}
    </div>
  )
}
