import { useState } from 'react'
import { api } from '../utils/api'

export default function CommanderDashboard() {
  const [cmdrName, setCmdrName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!cmdrName.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.inaraCmdr(cmdrName)
      if (data.error) { setError(data.error === 'Inara API key not configured' ? 'Inara API key not set. Go to Settings.' : data.error) }
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
        <h2>👤 Commander Dashboard</h2>
        <p>Your CMDR stats, ranks, and credits synced from Inara.cz</p>
      </div>

      <div className="card">
        <div className="card-title">Inara.cz Sync</div>
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
          <p style={{color: 'var(--dim)', fontSize: '0.85em', marginTop: 8}}>
            To use Inara sync, add your API key in <strong>Settings</strong>.
          </p>
        </div>
      )}

      {result && !result.error && (
        <>
          <div className="card">
            <div className="card-title">{result.commanderName || cmdrName}</div>
            <div className="stats-grid">
              <div className="stat-box"><div className="value">{result.credits || '—'}</div><div className="label">Credits</div></div>
              <div className="stat-box"><div className="value">{result.rank?.combat || '—'}</div><div className="label">Combat Rank</div></div>
              <div className="stat-box"><div className="value">{result.rank?.trade || '—'}</div><div className="label">Trade Rank</div></div>
              <div className="stat-box"><div className="value">{result.rank?.exploration || '—'}</div><div className="label">Explore Rank</div></div>
            </div>
          </div>
        </>
      )}

      {!result && !error && (
        <div className="card">
          <div className="empty-state">
            Enter your CMDR name and click Sync to load your stats from Inara.cz
          </div>
        </div>
      )}
    </div>
  )
}
