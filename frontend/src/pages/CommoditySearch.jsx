import { useState } from 'react'
import { api } from '../utils/api'

const POPULAR = ['Gold', 'Silver', 'Platinum', 'Palladium', 'Tritium', 'Lithium', 'Coffee', 'Wine', 'Gold Ore', 'Diamond']

export default function CommoditySearch() {
  const [commodity, setCommodity] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(name) {
    const target = name || commodity
    if (!target.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.searchCommodity(target)
      setResult(data)
    } catch (e) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>📦 Commodity Search</h2>
        <p>Find where to buy or sell specific commodities across the galaxy</p>
      </div>

      <div className="card">
        <div className="card-title">Search Commodity</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Commodity Name</label>
            <input value={commodity} onChange={e => setCommodity(e.target.value)}
              placeholder="e.g. Gold, Silver, Tritium..." onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading}>
          {loading ? 'Searching...' : 'Search Galaxy'}
        </button>
      </div>

      <div className="card">
        <div className="card-title">Popular Commodities</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
          {POPULAR.map(c => (
            <button key={c} className="btn btn-secondary" onClick={() => { setCommodity(c); handleSearch(c) }}
              style={{padding: '6px 12px', fontSize: '0.8em'}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="card"><span style={{color: 'var(--red)'}}>{error}</span></div>}

      {result && !result.error && (
        <div className="card">
          <div className="card-title">Results for "{commodity}"</div>
          {Array.isArray(result) && result.length > 0 ? (
            <div className="results-list">
              {result.slice(0, 15).map((r, i) => (
                <div key={i} className="result-item">
                  <div className="name">{r.name || r.station || 'Unknown station'}</div>
                  <div className="info">
                    {r.system ? `System: ${r.system}` : ''} {r.price ? `• €${r.price.toLocaleString()}` : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No results found. Try a different commodity name.</div>
          )}
        </div>
      )}

      {result?.error && (
        <div className="card">
          <div className="empty-state">EDSM commodity search unavailable. Try using Trade Search to look up specific systems.</div>
        </div>
      )}
    </div>
  )
}
