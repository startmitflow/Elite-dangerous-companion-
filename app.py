"""
Elite Dangerous Companion — v0.3
Features: System search + Station market + Route planner
"""

import os
import urllib.request
import urllib.parse
import json
from flask import Flask, render_template_string, jsonify, request

app = Flask(__name__)

EDSM_API = "https://www.edsm.net"
HEADERS = {"User-Agent": "StartMit-EliteCompanion/0.3"}


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
    stations_data = esm_get("/api-system-v1/stations", {"systemName": name})
    # EDSM returns { "stations": [...] }
    stations_list = stations_data.get("stations", []) if isinstance(stations_data, dict) else []
    if not stations_list and isinstance(stations_data, list):
        stations_list = stations_data
    return jsonify({
        "system": system,
        "stations": stations_list,
    })


@app.route("/api/market/<system>/<station>")
def api_market(system, station):
    """EDSM station market data."""
    data = esm_get("/api-system-v1/stations/market", {
        "systemName": system,
        "stationName": station,
    })
    return jsonify(data)


@app.route("/api/route")
def api_route():
    """Route planner: distance + estimated jumps between two systems."""
    from_sys = request.args.get("from", "").strip()
    to_sys = request.args.get("to", "").strip()
    if not from_sys or not to_sys:
        return jsonify({"error": "Both 'from' and 'to' system names required"}), 400

    from_data = esm_get("/api-v1/system", {
        "systemName": from_sys,
        "showCoordinates": 1,
    })
    to_data = esm_get("/api-v1/system", {
        "systemName": to_sys,
        "showCoordinates": 1,
    })

    result = {"from": from_sys, "to": to_sys}

    if from_data.get("error"):
        result["fromError"] = from_data.get("error")
    if to_data.get("error"):
        result["toError"] = to_data.get("error")

    # Get jump range from query param, default to 30 (medium exploration ship)
    jump_range = float(request.args.get("range", 30))
    if jump_range <= 0:
        jump_range = 30

    try:
        fc = from_data.get("coordinates", {})
        tc = to_data.get("coordinates", {})
        dist = ((tc.get("x", 0) - fc.get("x", 0))**2 +
                (tc.get("y", 0) - fc.get("y", 0))**2 +
                (tc.get("z", 0) - fc.get("z", 0))**2)**0.5
        result["distanceLy"] = round(dist, 2)
        result["estJumps"] = max(1, round(dist / jump_range))
        result["jumpRange"] = jump_range
        result["fromCoords"] = {"x": fc.get("x"), "y": fc.get("y"), "z": fc.get("z")}
        result["toCoords"] = {"x": tc.get("x"), "y": tc.get("y"), "z": tc.get("z")}
    except (TypeError, ValueError):
        result["error"] = "Could not calculate route — systems may not have coordinates"


    return jsonify(result)


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
.result-item:hover{border-color:var(--cyan);cursor:pointer}
.form-group{display:flex;flex-direction:column;gap:5px}
.form-group label{font-size:0.72em;color:var(--dim);text-transform:uppercase}
.result-item .name{color:var(--cyan);font-weight:600;font-size:1em;margin-bottom:4px}
.result-item .info{color:var(--dim);font-size:0.8em}
.market-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)}
.market-row:last-child{border-bottom:none}
.market-name{flex:2;color:var(--text)}
.market-buy{flex:1;text-align:right;color:var(--green)}
.market-sell{flex:1;text-align:right;color:var(--red)}
.market-supply{flex:1;text-align:right;color:var(--dim);font-size:0.8em}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.7em;margin:2px}
.badge-green{background:rgba(0,255,136,0.12);color:var(--green)}
.badge-cyan{background:rgba(0,212,255,0.12);color:var(--cyan)}
.empty-state{text-align:center;padding:30px;color:var(--dim);font-size:0.9em}
.error{color:var(--red);text-align:center;padding:20px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
.stat{background:var(--input);border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center}
.stat .val{font-size:1.2em;font-weight:700;color:var(--cyan)}
.stat .lbl{font-size:0.65em;color:var(--dim);text-transform:uppercase;margin-top:2px}
.market-loading{text-align:center;padding:15px;color:var(--dim);font-size:0.85em}
.market-header{display:flex;justify-content:space-between;padding:8px 0;border-bottom:2px solid var(--accent);margin-bottom:8px;font-size:0.75em;color:var(--dim);text-transform:uppercase}
</style>
</head>
<body>

<h1>⚔ Elite Companion</h1>
<p class="subtitle">by StartMit — v0.3</p>

<div class="card">
  <input id="systemInput" type="text" placeholder="Enter system name..." value="Diaguandri">
  <button id="searchBtn" onclick="search()">Search System</button>
</div>

<div class="card" style="border-color:var(--accent);border-width:2px">
  <div class="card-title" style="color:var(--accent)">🗺️ Route Planner</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 80px auto;gap:10px;align-items:end">
    <div class="form-group">
      <label>From System</label>
      <input id="routeFrom" type="text" placeholder="Sol">
    </div>
    <div class="form-group">
      <label>To System</label>
      <input id="routeTo" type="text" placeholder="Diaguandri">
    </div>
    <div class="form-group">
      <label>Jump (Ly)</label>
      <input id="routeRange" type="number" placeholder="30" value="30" style="margin-bottom:0">
    </div>
    <button class="btn btn-primary" style="width:auto;padding:12px 20px" onclick="calcRoute()">Go</button>
  </div>
  <div id="routeResult" style="margin-top:12px;display:none"></div>
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

async function loadMarket(systemName, stationName, btn) {
  // Toggle: click again to collapse
  const existing = document.getElementById('market-' + stationName.replace(/[^a-z0-9]/gi, '_'));
  if (existing) { existing.remove(); return; }

  btn.disabled = true;
  btn.textContent = 'Loading market...';

  const container = document.createElement('div');
  container.id = 'market-' + stationName.replace(/[^a-z0-9]/gi, '_');
  container.innerHTML = '<div class="market-loading">Loading market data...</div>';
  btn.parentElement.parentElement.appendChild(container);

  try {
    const res = await fetch('/api/market/' + encodeURIComponent(systemName) + '/' + encodeURIComponent(stationName));
    const data = await res.json();
    renderMarket(container, data);
  } catch (e) {
    container.innerHTML = '<div class="error">Failed to load market data.</div>';
  } finally {
    btn.disabled = false;
    btn.textContent = 'View Market';
  }
}

function renderMarket(container, data) {
  // EDSM returns { commodities: [...] } or empty {}
  const commodities = data.commodities || [];
  if (!data || data.error || commodities.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:15px">No market data available for this station.</div>';
    return;
  }

  let html = '<div style="margin-top:12px">';
  html += '<div class="market-header"><span>Commodity</span><span>Buy</span><span>Sell</span><span>Supply</span></div>';
  commodities.slice(0, 20).forEach(item => {
    html += '<div class="market-row">';
    html += '<span class="market-name">' + escapeHtml(item.name || 'Unknown') + '</span>';
    html += '<span class="market-buy">' + (item.buyPrice ? '€' + item.buyPrice.toLocaleString() : '-') + '</span>';
    html += '<span class="market-sell">' + (item.sellPrice ? '€' + item.sellPrice.toLocaleString() : '-') + '</span>';
    html += '<span class="market-supply">' + (item.stock != null ? item.stock.toLocaleString() : (item.demand || '-')) + '</span>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function render(data, queryName) {
  const sys = data.system || {};
  const stations = data.stations || [];
  let html = '';

  // System info
  if (!sys.error && sys.name) {
    html += '<div class="card">';
    html += '<div style="border:none;background:none;padding:0"><div class="name" style="color:var(--cyan);font-size:1.1em">🌌 ' + escapeHtml(sys.name) + '</div>';
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
    html += '<div class="card"><div style="color:var(--accent);font-size:0.85em;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px">Stations (' + stations.length + ') — click to view market</div>';
    stations.forEach(s => {
      const safeId = s.name.replace(/[^a-z0-9]/gi, '_');
      html += '<div class="result-item" onclick="loadMarket(\'' + escapeHtml(sys.name || queryName) + '\', \'' + escapeHtml(s.name) + '\', this)">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<div><div class="name">' + escapeHtml(s.name) + '</div>';
      html += '<div class="info">' + (s.type || 'Unknown') + (s.distanceToStar ? ' • ' + s.distanceToStar + ' ls' : '') + '</div>';
      html += '<div style="margin-top:4px">';
      if (s.hasMarket) html += '<span class="badge badge-green">Market</span>';
      if (s.hasShipyard) html += '<span class="badge badge-cyan">Shipyard</span>';
      if (s.hasOutfitting) html += '<span class="badge badge-cyan">Outfitting</span>';
      if (s.hasRefuel) html += '<span class="badge badge-green">Refuel</span>';
      html += '</div></div>';
      html += '<div style="text-align:right"><button class="btn btn-secondary" style="width:auto;padding:8px 14px;font-size:0.8em" onclick="event.stopPropagation();loadMarket(\'' + escapeHtml(sys.name || queryName) + '\', \'' + escapeHtml(s.name) + '\', this)">View Market</button></div>';
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
document.getElementById('routeTo').addEventListener('keypress', e => {
  if (e.key === 'Enter') calcRoute();
});

async function calcRoute() {
  const from = $('routeFrom').value.trim();
  const to = $('routeTo').value.trim();
  const range = parseFloat($('routeRange').value) || 30;
  if (!from || !to) return;
  const result = $('routeResult');
  result.style.display = 'none';
  result.innerHTML = '<div class="empty-state">Calculating route...</div>';
  result.style.display = 'block';
  try {
    const res = await fetch('/api/route?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to) + '&range=' + range);
    const data = await res.json();
    if (data.error) {
      result.innerHTML = '<div class="error">' + escapeHtml(data.error) + '</div>';
    } else {
      let html = '<div class="route-card">';
      html += '<div style="color:var(--accent);font-size:0.9em;margin-bottom:10px">Route: ' + escapeHtml(data.from) + ' → ' + escapeHtml(data.to) + '</div>';
      html += '<div style="color:var(--dim);font-size:0.8em;margin-bottom:10px">Jump range: ' + data.jumpRange + ' Ly</div>';
      html += '<div class="row"><span class="label">Distance</span><span class="value">' + (data.distanceLy || '?') + ' Ly</span></div>';
      html += '<div class="row"><span class="label">Est. Jumps</span><span class="value">' + (data.estJumps || '?') + '</span></div>';
      if (data.fromCoords && data.toCoords) {
        html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">';
        html += '<div class="row"><span class="label">From</span><span class="value" style="font-size:0.8em">(' + data.fromCoords.x?.toFixed(1) + ', ' + data.fromCoords.y?.toFixed(1) + ', ' + data.fromCoords.z?.toFixed(1) + ')</span></div>';
        html += '<div class="row"><span class="label">To</span><span class="value" style="font-size:0.8em">(' + data.toCoords.x?.toFixed(1) + ', ' + data.toCoords.y?.toFixed(1) + ', ' + data.toCoords.z?.toFixed(1) + ')</span></div>';
        html += '</div>';
      }
      if (data.fromError) html += '<div style="color:var(--red);margin-top:8px;font-size:0.82em">From system not found: ' + escapeHtml(data.fromError) + '</div>';
      if (data.toError) html += '<div style="color:var(--red);margin-top:8px;font-size:0.82em">To system not found: ' + escapeHtml(data.toError) + '</div>';
      html += '</div>';
      result.innerHTML = html;
    }
  } catch (e) {
    result.innerHTML = '<div class="error">Failed to calculate route.</div>';
  }
}
</script>

</body>
</html>
'''

@app.route("/")
def index():
    return render_template_string(HTML)


if __name__ == "__main__":
    print("Elite Companion v0.3 running on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
