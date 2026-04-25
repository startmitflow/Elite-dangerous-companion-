import { useState } from 'react'
import { api } from '../utils/api'

export default function RoutePlanner() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [jumps, setJumps] = useState(5)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePlan() {
    if (!from.trim() || !to.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.route(from, to, jumps)
      if (data.error) { setError(data.error) }
      else { setResult(data) }
    } catch (e) {
      setError('Could not calculate route')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🗺️ Route Planner</h2>
        <p>Plan multi-jump routes and estimate cargo capacity</p>
      </div>

      <div className="card">
        <div className="card-title">Route Options</div>
        <div className="form-grid">
          <div className="form-group">
            <label>From System</label>
            <input value={from} onChange={e => setFrom(e.target.value)} placeholder="e.g. Sol" />
          </div>
          <div className="form-group">
            <label>To System</label>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="e.g. Diaguandri"
              onKeyDown={e => e.key === 'Enter' && handlePlan()} />
          </div>
          <div className="form-group">
            <label>Max Jumps</label>
            <input type="number" value={jumps} onChange={e => setJumps(Number(e.target.value))} min={1} max={50} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handlePlan} disabled={loading}>
          {loading ? 'Calculating...' : 'Plan Route'}
        </button>
      </div>

      {error && <div className="card"><span style={{color: 'var(--red)'}}>{error}</span></div>}

      {result?.route && result.route.length > 0 && (
        <div className="card">
          <div className="card-title">Route Found</div>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="value" style={{color: 'var(--accent)'}}>{result.route[0].distance}</div>
              <div className="label">Ly Distance</div>
            </div>
            <div className="stat-box">
              <div className="value">{result.route[0].jumps_needed}</div>
              <div className="label">Est. Jumps</div>
            </div>
          </div>
          <div style={{marginTop: 12, color: 'var(--dim)', fontSize: '0.85em'}}>
            From <strong style={{color: 'var(--cyan)'}}>{result.route[0].from}</strong> to{' '}
            <strong style={{color: 'var(--cyan)'}}>{result.route[0].to}</strong>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">💡 Tips</div>
        <ul style={{color: 'var(--dim)', fontSize: '0.85em', paddingLeft: 20}}>
          <li>Use stations with <strong style={{color: 'var(--green)'}}>high demand</strong> for selling</li>
          <li>Check <strong style={{color: 'var(--cyan)'}}>economy type</strong> — Industrial systems buy minerals, Agricultural buy food</li>
          <li>Bookmark profitable routes and compare them here</li>
        </ul>
      </div>
    </div>
  )
}
