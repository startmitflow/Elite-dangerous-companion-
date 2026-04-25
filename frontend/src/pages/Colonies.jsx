import { useState } from 'react'
import { api } from '../utils/api'

export default function Colonies() {
  const [system, setSystem] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!system.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.colonies(system)
      if (data.error) { setError(data.error); setResult(null) }
      else { setResult(Array.isArray(data) ? data : []) }
    } catch (e) {
      setError('Could not reach EDSM')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🏭 Colonies</h2>
        <p>Plan surface installations and view colony infrastructure</p>
      </div>

      <div className="card">
        <div className="card-title">Find Colonies in System</div>
        <div className="form-grid">
          <div className="form-group">
            <label>System Name</label>
            <input value={system} onChange={e => setSystem(e.target.value)}
              placeholder="e.g. Golang, Potapots" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Find Colonies'}
        </button>
      </div>

      {error && <div className="card"><span style={{color: 'var(--red)'}}>{error}</span></div>}

      {result && result.length > 0 && (
        <div className="card">
          <div className="card-title">Stations / Installations ({result.length})</div>
          <div className="results-list">
            {result.map(s => (
              <div key={s.name} className="result-item">
                <div className="name">{s.name}</div>
                <div className="info">
                  {s.type} {s.distanceToStar ? `• ${s.distanceToStar} ls` : ''}
                </div>
                <div style={{marginTop: 4}}>
                  {s.hasMarket ? <span className="badge badge-green">Market</span> : ''}
                  {s.hasShipyard ? <span className="badge badge-cyan">Shipyard</span> : ''}
                  {s.hasOutfitting ? <span className="badge badge-accent">Outfitting</span> : ''}
                  {s.hasRefuel ? <span className="badge badge-green">Refuel</span> : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.length === 0 && (
        <div className="card">
          <div className="empty-state">No stations found in this system. EDSM colony data may be limited.</div>
        </div>
      )}

      <div className="card">
        <div className="card-title">💡 Colony Planning Tips</div>
        <ul style={{color: 'var(--dim)', fontSize: '0.85em', paddingLeft: 20}}>
          <li>Place colonies near <strong style={{color: 'var(--cyan)'}}>resource-rich bodies</strong> for self-sufficiency</li>
          <li>Build <strong style={{color: 'var(--accent)'}}>Refinery</strong> near ore deposits</li>
          <li>Build <strong style={{color: 'var(--green)'}}>Agriculture</strong> near water/terrestrial planets</li>
          <li>EDSM doesn't have full colony planner — use <strong>EDDiscovery</strong> for detailed planning</li>
        </ul>
      </div>
    </div>
  )
}
