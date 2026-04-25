import { useState } from 'react'
import { api } from '../utils/api'

export default function Ships() {
  const [cmdrName, setCmdrName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!cmdrName.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.inaraShips(cmdrName)
      if (data.error) { setError(data.error === 'Inara API key not configured' ? 'Add Inara API key in Settings.' : data.error) }
      else { setResult(data) }
    } catch (e) {
      setError('Could not reach Inara')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🚀 Ships</h2>
        <p>View your ship collection and module loadouts from Inara</p>
      </div>

      <div className="card">
        <div className="card-title">Your Ships</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Commander Name</label>
            <input value={cmdrName} onChange={e => setCmdrName(e.target.value)}
              placeholder="Your CMDR name" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading...' : 'Load Ships'}
        </button>
      </div>

      {error && (
        <div className="card" style={{borderColor: 'var(--red)'}}>
          <span style={{color: 'var(--red)'}}>⚠️ {error}</span>
        </div>
      )}

      {result && !result.error && (
        <div className="card">
          <div className="card-title">Ship List</div>
          {Array.isArray(result.ships) && result.ships.length > 0 ? (
            <div className="results-list">
              {result.ships.map((ship, i) => (
                <div key={i} className="result-item">
                  <div className="name">{ship.name || ship.shipName || `Ship ${i + 1}`}</div>
                  <div className="info">
                    {ship.shipType || 'Unknown type'} {ship.modules ? `• ${ship.modules.length} modules` : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No ships found or Inara API unavailable</div>
          )}
        </div>
      )}

      {!result && !error && (
        <div className="card">
          <div className="empty-state">Enter your CMDR name to load your ship list from Inara.cz</div>
        </div>
      )}
    </div>
  )
}
