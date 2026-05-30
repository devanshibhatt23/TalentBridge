import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { createJob } from '../services/api.js'
import { formatJobType } from '../utils/formatters.js'
import apiMap from '../api.json'

const emptyForm = {
  title: '',
  company: '',
  description: '',
  requirements: '',
  location: '',
  jobType: 'full-time',
  salary: '',
  skills: '',
  additionalDetails: '',
  deadline: '',
  openings: 1,
}

export function CreateJob() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill the company from user profile on mount
  useEffect(() => {
    if (user?.company) {
      setForm((prev) => ({ ...prev, company: user.company }))
    }
  }, [user])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await createJob({
        ...form,
        skills: form.skills
          ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        openings: Number(form.openings) || 1,
        deadline: form.deadline || undefined,
      })
      const id = res.data?.job?._id
      navigate(id ? `/jobs/${id}` : '/recruiter-dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container page">
      <div className="page__header">
        <div>
          <h1 className="h1">Post a job</h1>
          <p className="muted">Create a new opportunity for candidates.</p>
        </div>
      </div>

      <form className="card form-grid" onSubmit={onSubmit}>
        <Alert type="error">{error}</Alert>

        <label className="field">
          <span className="field__label">Title</span>
          <input className="input" required value={form.title} onChange={(e) => updateField('title', e.target.value)} />
        </label>

        <label className="field">
          <span className="field__label">Company</span>
          <input 
            className={`input ${user?.company ? 'input--readonly' : ''}`} 
            value={form.company} 
            onChange={(e) => !user?.company && updateField('company', e.target.value)} 
            readOnly={!!user?.company}
            placeholder="Company Name" 
          />
          {user?.company && <span className="field__hint">Auto-filled from your recruiter profile</span>}
        </label>

        <label className="field field--full">
          <span className="field__label">Description</span>
          <textarea className="input textarea" required rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
        </label>

        <label className="field field--full">
          <span className="field__label">Requirements</span>
          <textarea className="input textarea" required rows={3} value={form.requirements} onChange={(e) => updateField('requirements', e.target.value)} />
        </label>

        <label className="field">
          <span className="field__label">Location</span>
          <input className="input" required value={form.location} onChange={(e) => updateField('location', e.target.value)} />
        </label>

        <label className="field">
          <span className="field__label">Job type</span>
          <select className="input" value={form.jobType} onChange={(e) => updateField('jobType', e.target.value)}>
            {apiMap.jobTypes.map((type) => (
              <option key={type} value={type}>{formatJobType(type)}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Salary</span>
          <input className="input" value={form.salary} onChange={(e) => updateField('salary', e.target.value)} placeholder="e.g. ₹12–15 LPA" />
        </label>

        <label className="field">
          <span className="field__label">Skills (comma-separated)</span>
          <input className="input" value={form.skills} onChange={(e) => updateField('skills', e.target.value)} placeholder="React, Node.js" />
        </label>

        <label className="field">
          <span className="field__label">Deadline</span>
          <input className="input" type="date" value={form.deadline} onChange={(e) => updateField('deadline', e.target.value)} />
        </label>

        <label className="field">
          <span className="field__label">Openings</span>
          <input className="input" type="number" min={1} value={form.openings} onChange={(e) => updateField('openings', e.target.value)} />
        </label>

        <label className="field field--full">
          <span className="field__label">Additional details</span>
          <textarea className="input textarea" rows={2} value={form.additionalDetails} onChange={(e) => updateField('additionalDetails', e.target.value)} />
        </label>

        <div className="form-actions field--full">
          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post job'}
          </button>
        </div>
      </form>
    </div>
  )
}
