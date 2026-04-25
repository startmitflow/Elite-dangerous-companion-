"""
Elite Dangerous Companion — MVP v0.1
Single endpoint: search a system on EDSM.
"""

import os
import urllib.request
import urllib.parse
import json
from flask import Flask, render_template_string, jsonify

app = Flask(__name__)

EDSM_API = "https://www.edsm.net"
HEADERS = {"User-Agent": "StartMit-EliteCompanion/0.1"}


def esm_get(endpoint, params=None):
    url = f"{EDSM_API}{endpoint}"
    if params:
        qs = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
        url = f"{url}?{qs}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        return {"error": str(e)}


@app.route("/api/system/<name>")
def api_system(name):
    """EDSM system info + stations."""
    system = esm_get("/api-v1/system", {
        "systemName": name,
        "showInformation": 1,
        "showCoordinates": 1,
        "showStations": 1,
    })
    stations = esm_get("/api-system-v1/stations", {"systemName": name})
    return jsonify({
        "system": system,
        "stations": stations if not isinstance(stations, dict) or "error" not in stations else [],
    })


HTML = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Elite Companion</title>
<style>
:root{--bg:#0a0a12;--card:#12121f;--input:#1a1a2e;--accent:#f5a623;--cyan:#00d4ff;--green:#00ff88;--red:#ff4757;--text:#e0e0e0;--dim:#888;--border:#2a2a3e;}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Segoe UI,Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding:40px 20px;display:flex;flex-direction:column;align-items:center}
h1{color:var(--accent);font-size:1.4em;margin-bottom:4px}
.subtitle{color:var(--dim);font-size:0.8em;margin-bottom:24px}
.card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:20px;width:100%;max-width:600px;margin-bottom:16px}
input{width:100%;padding:12px;border:1px solid var(--border);border-radius:6px;background:var(--input);color:var(--text);font-size:1em;margin-bottom:12px}
input:focus{outline:none;border-color:var(--cyan)}
button{background:var(--accent);color:#000;border:none;padding:12px 24px;border-radius:6px;font-size:0.95em;font-weight:600;cursor:pointer;width:100%}
button:hover{background:#ffb84d}
button:disabled{opacity:0.5;cursor:not-allowed}
.result-item{background:var(--input);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:10px;transition:border-color 0.2s}
.result-item:hover{border-color:var(--cyan)}
.result-item .name{color:var(--cyan);font-weight:600;font-size:1em;margin-bottom:4px}
.result-item .info{color:var(--dim);font-size:0.8em}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.7em;margin:2px}
.badge-green{background:rgba(0,255,136,0.12);color:var(--green)}
.badge-cyan{background:rgba(0,212,255,0.12);color:var(--cyan)}
.empty-state{text-align:center;padding:30px;color:var(--dim);font-size:0.9em}
.error{color:var(--red);text-align:center;padding:20px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
.stat{background:var(--input);border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center}
.stat .val{font-size:1.2em;font-weight:700;color:var(--cyan)}
.stat .lbl{font-size:0.65em;color:var(--dim);text-transform:uppercase;margin-top:2px}
</style>
</head>
<body>

<h1>⚔ Elite Companion</h1>
<p class="subtitle">by StartMit — MVP v0.1</p>

<div class="card">
  <input id="systemInput" type="text" placeholder="Enter system name..." value="Diaguandri">
  <button id="searchBtn" onclick="search()">Search System</button>
</div>

<div id="results"></div>

<script>
const $ = id => document.getElementById(id);

async function search() {
  const name = $('systemInput').value.trim();
  if (!name) return;
  $('searchBtn').disabled = true;
  $('searchBtn').textContent = 'Searching...';
  $('results').innerHTML = '<div class="empty-state">Loading...</div>';

  try {
    const res = await fetch('/api/system/' + encodeURIComponent(name));
    const data = await res.json();
    render(data, name);
  } catch (e) {
    $('results').innerHTML = '<div class="error">Failed to reach server.</div>';
  } finally {
    $('searchBtn').disabled = false;
    $('searchBtn').textContent = 'Search System';
  }
}

function render(data, queryName) {
  const sys = data.system || {};
  const stations = data.stations || [];
  let html = '';

  // System info
  if (!sys.error && sys.name) {
    html += '<div class="card">';
    html += '<div class="result-item" style="border:none;background:none;padding:0"><div class="name">🌌 ' + escapeHtml(sys.name) + '</div>';
    if (sys.information) {
      html += '<div class="info">Faction: ' + escapeHtml(sys.information.faction || 'Unknown') + ' • State: ' + escapeHtml(sys.information.factionState || 'Unknown') + '</div>';
      html += '<div class="info">Economy: ' + escapeHtml(sys.information.economy || 'Unknown') + ' • Security: ' + escapeHtml(sys.information.security || 'Unknown') + '</div>';
    }
    html += '</div>';
    if (sys.coordinates) {
      html += '<div class="stats"><div class="stat"><div class="val">' + (sys.coordinates.x || 0).toFixed(1) + '</div><div class="lbl">X</div></div>';
      html += '<div class="stat"><div class="val">' + (sys.coordinates.y || 0).toFixed(1) + '</div><div class="lbl">Y</div></div>';
      html += '<div class="stat"><div class="val">' + (sys.coordinates.z || 0).toFixed(1) + '</div><div class="lbl">Z</div></div></div>';
    }
    html += '</div>';
  } else {
    html += '<div class="error">System "' + escapeHtml(queryName) + '" not found.</div>';
  }

  // Stations
  if (Array.isArray(stations) && stations.length > 0) {
    html += '<div class="card"><div style="color:var(--accent);font-size:0.85em;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px">Stations (' + stations.length + ')</div>';
    stations.forEach(s => {
      html += '<div class="result-item">';
      html += '<div class="name">' + escapeHtml(s.name) + '</div>';
      html += '<div class="info">' + (s.type || 'Unknown') + (s.distanceToStar ? ' • ' + s.distanceToStar + ' ls' : '') + '</div>';
      html += '<div style="margin-top:4px">';
      if (s.hasMarket) html += '<span class="badge badge-green">Market</span>';
      if (s.hasShipyard) html += '<span class="badge badge-cyan">Shipyard</span>';
      if (s.hasOutfitting) html += '<span class="badge badge-cyan">Outfitting</span>';
      if (s.hasRefuel) html += '<span class="badge badge-green">Refuel</span>';
      html += '</div></div>';
    });
    html += '</div>';
  }

  $('results').innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Enter key
document.getElementById('systemInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') search();
});
</script>

</body>
</html>
'''

@app.route("/")
def index():
    return render_template_string(HTML)


if __name__ == "__main__":
    print("Elite Companion MVP running on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
