import { useState } from 'react'

export default function Settings() {
  const [inaraKey, setInaraKey] = useState(localStorage.getItem('inara-api-key') || '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    localStorage.setItem('inara-api-key', inaraKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="page-header">
        <h2>⚙️ Settings</h2>
        <p>Configure API keys and app preferences</p>
      </div>

      <div className="card">
        <div className="card-title">Inara.cz API Key</div>
        <p style={{color: 'var(--dim)', fontSize: '0.82em', marginBottom: 12}}>
          Get your API key from <strong style={{color: 'var(--cyan)'}}>inara.cz → Settings → API</strong>.
          Used for Commander Dashboard, Ships, and Materials sync.
        </p>
        <div className="form-group">
          <label>INARA API Key</label>
          <input
            type="password"
            value={inaraKey}
            onChange={e => setInaraKey(e.target.value)}
            placeholder="Paste your Inara API key here..."
          />
        </div>
        <button className="btn btn-primary" onClick={handleSave} style={{marginTop: 10}}>
          {saved ? '✅ Saved!' : 'Save Key'}
        </button>
      </div>

      <div className="card">
        <div className="card-title">Data Sources</div>
        <table className="data-table">
          <tbody>
            <tr><td style={{color: 'var(--cyan)'}}>EDSM</td><td>Elite Dangerous Star Map</td><td>✅ Always available</td></tr>
            <tr><td style={{color: 'var(--cyan)'}}>Inara.cz</td><td>Commander stats & ships</td><td>{inaraKey ? '✅ Configured' : '⚠️ Not configured'}</td></tr>
            <tr><td style={{color: 'var(--dim)'}}>EDDN</td><td>Live market data</td><td>⏳ Planned</td></tr>
            <tr><td style={{color: 'var(--dim)'}}>Trade Dangerous</td><td>Local route calc</td><td>⏳ Planned</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">About</div>
        <p style={{color: 'var(--dim)', fontSize: '0.85em'}}>
          <strong>Elite Companion</strong> v1.0 — built with React + Flask<br/>
          Deployed on Render.com<br/>
          Data from EDSM.net and Inara.cz
        </p>
      </div>
    </div>
  )
}
