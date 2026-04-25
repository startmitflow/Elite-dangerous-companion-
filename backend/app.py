"""
Elite Dangerous Companion — Flask Backend API
Serves React static build + REST API for all 11 features.
"""

import os
import urllib.request
import urllib.parse
import json
from flask import Flask, send_from_directory, jsonify, request

app = Flask(__name__, static_folder=None)

# ─── Config ──────────────────────────────────────────────────────────────────
EDSM_API = "https://www.edsm.net"
INARA_API = "https://inara.cz/inapi/v1"
INARA_API_KEY = os.environ.get("INARA_API_KEY", "")
REQUEST_HEADERS = {"User-Agent": "StartMit-EliteCompanion/1.0"}

# ─── EDSM Helpers ─────────────────────────────────────────────────────────────
def esm_get(endpoint, params=None):
    url = f"{EDSM_API}{endpoint}"
    if params:
        url += "?" + "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    req = urllib.request.Request(url, headers=REQUEST_HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        return {"error": str(e)}

# ─── API Routes ───────────────────────────────────────────────────────────────

@app.route("/api/system/<name>")
def api_system(name):
    """Get system info: coords, faction, stations count."""
    data = esm_get("/api-v1/system", {
        "systemName": name,
        "showInformation": 1,
        "showCoordinates": 1,
        "showStations": 1,
    })
    return jsonify(data)

@app.route("/api/stations/<system>")
def api_stations(system):
    """List stations in a system."""
    data = esm_get("/api-system-v1/stations", {"systemName": system})
    return jsonify(data)

@app.route("/api/market/<system>/<station>")
def api_market(system, station):
    """Get station market data (commodity prices)."""
    # EDSM market data endpoint
    data = esm_get("/api-system-v1/stations/market", {
        "systemName": system,
        "stationName": station,
    })
    return jsonify(data)

@app.route("/api/commodity/<name>")
def api_commodity(name):
    """Search for commodity across the galaxy via EDSM."""
    # EDSM doesn't have direct commodity search — we use system/station market
    # First get all stations with market data for this commodity name
    results = []
    # Try to search via the galactic search endpoint
    data = esm_get("/api-v1/galaxy-search", {
        "searchName": name,
        "type": "commodities",
    })
    return jsonify(data)

@app.route("/api/route")
def api_route():
    """Multi-jump route planner. ?from=SYSTEM&to=SYSTEM&jumps=5"""
    from_sys = request.args.get("from", "")
    to_sys = request.args.get("to", "")
    jumps = int(request.args.get("jumps", 5))
    
    # Get both systems' info
    from_data = esm_get("/api-v1/system", {
        "systemName": from_sys,
        "showCoordinates": 1,
    })
    to_data = esm_get("/api-v1/system", {
        "systemName": to_sys,
        "showCoordinates": 1,
    })
    
    route = []
    if "error" not in from_data and "error" not in to_data:
        # Calculate distance (simple Euclidean)
        try:
            fc = from_data.get("coordinates", {})
            tc = to_data.get("coordinates", {})
            dist = ((tc["x"]-fc["x"])**2 + (tc["y"]-fc["y"])**2 + (tc["z"]-fc["z"])**2)**0.5
            route = [{
                "from": from_sys,
                "to": to_sys,
                "distance": round(dist, 2),
                "jumps_needed": max(1, round(dist / 30)),  # ~30 LY per jump average
            }]
        except:
            route = [{"error": "Could not calculate route"}]
    
    return jsonify({"route": route, "from": from_data, "to": to_data})

@app.route("/api/galaxy/search")
def api_galaxy_search():
    """Galaxy-wide system search."""
    query = request.args.get("q", "")
    if len(query) < 2:
        return jsonify({"error": "Query too short"})
    data = esm_get("/api-v1/galaxy-search", {
        "searchName": query,
        "size": 20,
    })
    return jsonify(data)

@app.route("/api/colonies/<system>")
def api_colonies(system):
    """Get colonies in a system (EDSM doesn't have colony data — return station list)."""
    data = esm_get("/api-system-v1/stations", {"systemName": system})
    return jsonify(data)

# ─── Inara API Routes ─────────────────────────────────────────────────────────

def inara_request(endpoint, params):
    """Make authenticated request to Inara API."""
    if not INARA_API_KEY:
        return {"error": "Inara API key not configured"}
    url = f"{INARA_API}{endpoint}"
    payload = json.dumps(params).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "User-Agent": "StartMit-EliteCompanion/1.0",
        "Content-Type": "application/json",
        "INARA-API-KEY": INARA_API_KEY,
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        return {"error": str(e)}

@app.route("/api/inara/cmdr/<name>")
def api_inara_cmdr(name):
    """Get CMDR profile from Inara."""
    result = inara_request("/getCommanderProfile", {
        "commanderName": name,
    })
    return jsonify(result)

@app.route("/api/inara/ships/<cmdr>")
def api_inara_ships(cmdr):
    """Get CMDR ships from Inara."""
    result = inara_request("/getCommanderShipyard", {
        "commanderName": cmdr,
    })
    return jsonify(result)

@app.route("/api/inara/materials/<cmdr>")
def api_inara_materials(cmdr):
    """Get CMDR materials from Inara."""
    result = inara_request("/getCommanderMaterials", {
        "commanderName": cmdr,
    })
    return jsonify(result)

# ─── Health ───────────────────────────────────────────────────────────────────

@app.route("/api/health")
def api_health():
    return jsonify({"status": "ok", "inara_configured": bool(INARA_API_KEY)})

# ─── Serve React Build (production) ───────────────────────────────────────────

DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

@app.route("/")
def serve_index():
    return send_from_directory(DIST_DIR, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    file_path = os.path.join(DIST_DIR, path)
    if os.path.exists(file_path):
        return send_from_directory(DIST_DIR, path)
    # Fallback to index.html for SPA routing
    return send_from_directory(DIST_DIR, "index.html")

# ─── Dev Mode (run locally) ───────────────────────────────────────────────────
if __name__ == "__main__":
    print("Starting Elite Companion API on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
