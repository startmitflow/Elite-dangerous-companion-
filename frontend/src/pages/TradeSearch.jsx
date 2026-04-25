import { useState } from 'react'
import { api } from '../utils/api'

export default function TradeSearch() {
  const [system, setSystem] = useState('')
  const [station, setStation] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!system.trim()) return
    setLoading(true)
    setError('')
    try {
      const [sysData, stationList] = await Promise.all([
        api.searchSystem(system),
        station.trim() ? api.getStations(system) : Promise.resolve(null),
      ])
      setResult({ system: sysData, stations: stationList })
    } catch (e) {
      setError('System not found or EDSM unreachable')
    } finally {
      setLoading(false)
    }
  }

  async function handleStationMarket(stationName) {
    setStation(stationName)
    setLoading(true)
    try {
      const market = await api.getMarket(system, stationName)
      setResult(prev => ({ ...prev, market }))
    } catch (e) {
      setError('Could not load market data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🔍 Trade Search</h2>
        <p>Find systems, stations, and market data for trading</p>
      </div>

      <div className="card">
        <div className="card-title">System Search</div>
        <div className="form-grid">
          <div className="form-group">
            <label>System Name</label>
            <input
              value={system}
              onChange={e => setSystem(e.target.value)}
              placeholder="e.g. Diaguandri, Shinrarta Dezhra"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search System'}
        </button>
      </div>

      {error && <div className="card" style={{borderColor: 'var(--red)'}}><span style={{color: 'var(--red)'}}>{error}</span></div>}

      {result?.system && !result.system.error && (
        <div className="card">
          <div className="card-title">{result.system.name}</div>
          {result.system.coordinates && (
            <div className="stats-grid">
              <div className="stat-box"><div className="value">{result.system.coordinates.x?.toFixed(1)}</div><div className="label">X</div></div>
              <div className="stat-box"><div className="value">{result.system.coordinates.y?.toFixed(1)}</div><div className="label">Y</div></div>
              <div className="stat-box"><div className="value">{result.system.coordinates.z?.toFixed(1)}</div><div className="label">Z</div></div>
            </div>
          )}
          {result.system.information && (
            <p style={{marginTop: 12, color: 'var(--dim)', fontSize: '0.85em'}}>
              <strong>Faction:</strong> {result.system.information.faction || 'Unknown'} &nbsp;|&nbsp;
              <strong>State:</strong> {result.system.information.factionState || 'Unknown'}
            </p>
          )}
        </div>
      )}

      {result?.stations && !result.stations.error && result.stations.length > 0 && (
        <div className="card">
          <div className="card-title">Stations in {system}</div>
          <div className="results-list">
            {result.stations.map(s => (
              <div key={s.name} className="result-item" onClick={() => handleStationMarket(s.name)}>
                <div className="name">{s.name}</div>
                <div className="info">
                  {s.maxLandingPad ? `${s.maxLandingPad} pad` : ''} {s.type ? `• ${s.type}` : ''}
                  {s.distanceToStar ? ` • ${s.distanceToStar} ls` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.market && !result.market.error && (
        <div className="card">
          <div className="card-title">📊 Market: {station}</div>
          {result.market.profit ? (
            <div>
              <div className="stats-grid">
                <div className="stat-box"><div className="value" style={{color: 'var(--green)'}}>€{result.market.profit}</div><div className="label">Profit</div></div>
                <div className="stat-box"><div className="value">{result.market.items?.length || 0}</div><div className="label">Commodities</div></div>
              </div>
              <table className="data-table" style={{marginTop: 12}}>
                <thead><tr><th>Commodity</th><th>Buy</th><th>Sell</th><th>Supply</th></tr></thead>
                <tbody>
                  {(result.market.items || []).slice(0, 20).map(item => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td className="price-buy">{item.priceBuy ? '€' + item.priceBuy.toLocaleString() : '-'}</td>
                      <td className="price-sell">{item.priceSell ? '€' + item.priceSell.toLocaleString() : '-'}</td>
                      <td>{item.stock || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No market data available. Station may not have economy data reported.</div>
          )}
        </div>
      )}
    </div>
  )
}
