import { useState } from 'react'
import { api } from '../utils/api'

export default function Materials() {
  const [cmdrName, setCmdrName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!cmdrName.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.inaraMaterials(cmdrName)
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
        <h2>🔬 Materials</h2>
        <p>Track your raw, encoded, and manufactured materials</p>
      </div>

      <div className="card">
        <div className="card-title">Sync Materials</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Commander Name</label>
            <input value={cmdrName} onChange={e => setCmdrName(e.target.value)}
              placeholder="Your CMDR name" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Syncing...' : 'Sync from Inara'}
        </button>
      </div>

      {error && (
        <div className="card" style={{borderColor: 'var(--red)'}}>
          <span style={{color: 'var(--red)'}}>⚠️ {error}</span>
        </div>
      )}

      {result && !result.error && (
        <>
          {['raw', 'encoded', 'manufactured'].map(category => (
            result[category] && result[category].length > 0 && (
              <div key={category} className="card">
                <div className="card-title">{category.charAt(0).toUpperCase() + category.slice(1)} Materials</div>
                <div className="results-list">
                  {(result[category] || []).map((m, i) => (
                    <div key={i} className="result-item">
                      <div className="name">{m.name || m}</div>
                      <div className="info">Grade: {m.grade || '?'} {m.quantity ? `• Qty: ${m.quantity}` : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </>
      )}

      {!result && !error && (
        <div className="card">
          <div className="empty-state">Enter your CMDR name to sync materials from Inara.cz. Requires Inara API key in Settings.</div>
        </div>
      )}
    </div>
  )
}
