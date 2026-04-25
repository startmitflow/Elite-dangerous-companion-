import { useState } from 'react'
import { api } from '../utils/api'

export default function StationAdvisor() {
  const [system, setSystem] = useState('')
  const [stations, setStations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!system.trim()) return
    setLoading(true)
    setError('')
    setSelected(null)
    try {
      const data = await api.getStations(system)
      if (data.error) { setError(data.error); setStations([]) }
      else { setStations(Array.isArray(data) ? data : []) }
    } catch (e) {
      setError('Could not reach EDSM API')
    } finally {
      setLoading(false)
    }
  }

  async function handleStationDetails(name) {
    setLoading(true)
    try {
      const market = await api.getMarket(system, name)
      setSelected({ name, market })
    } catch (e) {
      setError('Could not load station data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🛒 Station Advisor</h2>
        <p>Station services, economy type, market data, and facilities</p>
      </div>

      <div className="card">
        <div className="card-title">Find Station</div>
        <div className="form-grid">
          <div className="form-group">
            <label>System Name</label>
            <input value={system} onChange={e => setSystem(e.target.value)}
              placeholder="e.g. Diaguandri" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading...' : 'Find Stations'}
        </button>
      </div>

      {error && <div className="card"><span style={{color: 'var(--red)'}}>{error}</span></div>}

      {stations.length > 0 && (
        <div className="card">
          <div className="card-title">Stations ({stations.length})</div>
          <div className="results-list">
            {stations.map(s => (
              <div key={s.name} className="result-item" onClick={() => handleStationDetails(s.name)}>
                <div className="name">{s.name}</div>
                <div className="info">
                  {s.type} {s.distanceToStar ? `• ${s.distanceToStar} ls from star` : ''}
                </div>
                <div style={{marginTop: 4}}>
                  {s.hasMarket ? <span className="badge badge-green">Market</span> : ''}
                  {s.hasShipyard ? <span className="badge badge-cyan">Shipyard</span> : ''}
                  {s.hasOutfitting ? <span className="badge badge-accent">Outfitting</span> : ''}
                  {s.hasRepair ? <span className="badge badge-green">Repair</span> : ''}
                  {s.hasRefuel ? <span className="badge badge-green">Refuel</span> : ''}
                  {s.hasRearm ? <span className="badge badge-green">Rearm</span> : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="card">
          <div className="card-title">📊 {selected.name} — Market</div>
          {selected.market?.items ? (
            <table className="data-table">
              <thead><tr><th>Commodity</th><th>Buy</th><th>Sell</th><th>Supply</th><th>Demand</th></tr></thead>
              <tbody>
                {selected.market.items.map(item => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td className="price-buy">{item.priceBuy ? '€' + item.priceBuy.toLocaleString() : '-'}</td>
                    <td className="price-sell">{item.priceSell ? '€' + item.priceSell.toLocaleString() : '-'}</td>
                    <td>{item.stock?.toLocaleString() || '-'}</td>
                    <td>{item.demand?.toLocaleString() || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No market data available</div>
          )}
        </div>
      )}
    </div>
  )
}
