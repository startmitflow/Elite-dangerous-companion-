import { useState } from 'react'
import { api } from '../utils/api'

export default function SystemSearch() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!query.trim() || query.length < 2) return
    setLoading(true)
    setError('')
    try {
      const data = await api.searchSystem(query)
      if (data.error) { setError(data.error); setResult(null) }
      else { setResult(data) }
    } catch (e) {
      setError('Could not reach EDSM API')
    } finally {
      setLoading(false)
    }
  }

  async function handleGalaxySearch() {
    if (!query.trim() || query.length < 2) return
    setLoading(true)
    setError('')
    try {
      const data = await api.galaxySearch(query)
      if (Array.isArray(data)) setResult({ suggestions: data })
      else { setResult(data) }
    } catch (e) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🌌 System Search</h2>
        <p>Look up systems, coordinates, factions, and galaxy information</p>
      </div>

      <div className="card">
        <div className="card-title">Galaxy Search</div>
        <div className="form-grid">
          <div className="form-group">
            <label>System Name</label>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Type at least 2 characters..." onKeyDown={e => e.key === 'Enter' && handleGalaxySearch()} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleGalaxySearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search Galaxy'}
        </button>
      </div>

      {error && <div className="card"><span style={{color: 'var(--red)'}}>{error}</span></div>}

      {result?.suggestions && (
        <div className="card">
          <div className="card-title">Search Results ({result.suggestions.length})</div>
          <div className="results-list">
            {result.suggestions.map(s => (
              <div key={s.name} className="result-item" onClick={() => { setQuery(s.name); setResult(null); setTimeout(handleSearch, 50) }}>
                <div className="name">{s.name}</div>
                <div className="info">{s.type || 'System'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && !result.suggestions && !result.error && (
        <>
          <div className="card">
            <div className="card-title">{result.name}</div>
            <div className="stats-grid">
              {result.coordinates && (
                <>
                  <div className="stat-box"><div className="value">{result.coordinates.x?.toFixed(1)}</div><div className="label">X</div></div>
                  <div className="stat-box"><div className="value">{result.coordinates.y?.toFixed(1)}</div><div className="label">Y</div></div>
                  <div className="stat-box"><div className="value">{result.coordinates.z?.toFixed(1)}</div><div className="label">Z</div></div>
                </>
              )}
            </div>
          </div>
          {result.information && (
            <div className="card">
              <div className="card-title">System Information</div>
              <table className="data-table">
                <tbody>
                  <tr><td style={{color: 'var(--dim)'}}>Faction</td><td>{result.information.faction || 'Unknown'}</td></tr>
                  <tr><td style={{color: 'var(--dim)'}}>State</td><td>{result.information.factionState || 'Unknown'}</td></tr>
                  <tr><td style={{color: 'var(--dim)'}}>Economy</td><td>{result.information.economy || 'Unknown'}</td></tr>
                  <tr><td style={{color: 'var(--dim)'}}>Second Economy</td><td>{result.information.economy_SEC || 'Unknown'}</td></tr>
                  <tr><td style={{color: 'var(--dim)'}}>Security</td><td>{result.information.security || 'Unknown'}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
