# Elite Dangerous Companion

A full-featured web companion for Elite Dangerous pilots. Built with **React + Flask**, deployed on **Render**.

## Features (11)

| Feature | Description |
|---------|-------------|
| Trade Search | Find profitable routes and station markets |
| Station Advisor | Station services, economy, market data |
| System Search | Galaxy-wide system lookup with coords |
| Route Planner | Multi-jump route calculator |
| Commodity Search | Find specific commodities across the galaxy |
| Commander Dashboard | CMDR stats from Inara.cz |
| Ships | Ship list and loadouts from Inara |
| Materials | Material inventory from Inara |
| Colonies | Station/installation listing |
| Bookmarks | Save systems, stations, routes |
| Settings | API key configuration |

## Quick Start (Local Dev)

### 1. Backend
```bash
cd elite-companion
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### 2. Frontend (dev mode with proxy)
```bash
cd elite-companion/frontend
npm install
npm run dev
# Runs on http://localhost:5173 — API calls proxy to :5000
```

### 3. Build for Production
```bash
cd elite-companion/frontend
npm install
npm run build
# Creates dist/ folder
# Then run: cd .. && python app.py
```

## Deploy to Render

1. Push `elite-companion/` to GitHub
2. Connect repo to Render
3. Set `INARA_API_KEY` env var (optional, for Inara features)
4. Deploy — `render.yaml` handles the rest

## Tech Stack

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Flask (Python 3.11+)
- **APIs:** EDSM.net (free), Inara.cz (requires API key)
- **Deploy:** Render.com

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/<name>` | System info + coords |
| GET | `/api/stations/<system>` | Stations in system |
| GET | `/api/market/<sys>/<station>` | Station market data |
| GET | `/api/commodity/<name>` | Commodity search |
| GET | `/api/route?from=X&to=Y&jumps=N` | Route planner |
| GET | `/api/galaxy/search?q=X` | Galaxy search |
| GET | `/api/colonies/<system>` | Colony/station list |
| GET | `/api/inara/cmdr/<name>` | CMDR profile |
| GET | `/api/inara/ships/<cmdr>` | Ship list |
| GET | `/api/inara/materials/<cmdr>` | Material inventory |
| GET | `/api/health` | Health check |
