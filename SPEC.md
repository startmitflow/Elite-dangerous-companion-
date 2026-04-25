# Elite Dangerous Companion App — SPEC.md

## Stack
- **Frontend:** React 18 + Vite (production build served by Flask)
- **Backend:** Flask (Python 3.11+)
- **Deploy:** Render (flask service) — `render.yaml` for auto-deploy

## Features (11 total)
| # | Feature | Description | Data Source |
|---|---------|-------------|-------------|
| 1 | Trade Search | Find profitable buy/sell routes | EDSM |
| 2 | Station Advisor | Station services, market, shipyard | EDSM |
| 3 | System Search | System info, coords, factions | EDSM |
| 4 | Route Planner | Multi-jump route with cargo calc | EDSM |
| 5 | Commodity Search | Find specific commodity prices | EDSM |
| 6 | Commander Dashboard | CMDR stats, ranks, credits | Inara API |
| 7 | Colonies | Surface installation planner | EDSM |
| 8 | Ships | Ship loadouts, module shopping | Inara API |
| 9 | Materials | Raw/encoded/manufactured tracking | Inara API |
| 10 | Bookmarks | Save systems/stations | LocalStorage |
| 11 | Inara Integration | Sync with Inara.cz | Inara API |

## API Design (Flask Backend)
```
GET  /api/system/<name>              — System info + coords
GET  /api/stations/<system>         — Stations in system
GET  /api/market/<system>/<station> — Station market data
GET  /api/commodity/<name>          — Commodity price search
GET  /api/route                     — Route planner (from, to, jumps)
GET  /api/galaxy/search              — Galaxy-wide system search
POST /api/inara/cmdr/<name>          — Inara CMDR profile
GET  /api/inara/ships/<cmdr>         — Inara ship list
GET  /api/inara/materials/<cmdr>     — Inara materials
GET  /api/colonies/<system>          — Colonies in system
POST /api/bookmarks                  — Save bookmark (client-side via localStorage)
```

## Frontend Pages
- `/` — Trade Search (default landing)
- `/station` — Station Advisor
- `/system` — System Search
- `/route` — Route Planner
- `/commodity` — Commodity Search
- `/commander` — Commander Dashboard (Inara)
- `/colonies` — Colonies
- `/ships` — Ships
- `/materials` — Materials
- `/bookmarks` — Bookmarks
- `/settings` — API keys config

## UI Theme
- Dark sci-fi: `#0a0a12` bg, `#12121f` cards, `#f5a623` accent, `#00d4ff` cyan
- Sidebar navigation (220px, fixed left)
- Main content area with page routing
- Responsive: sidebar collapses on mobile

## Deployment
- `render.yaml` spins up a Python Flask service
- Build: `cd elite-companion/frontend && npm install && npm run build`
- Serve: Flask serves `../elite-companion/frontend/dist` as static files
- All API routes prefixed `/api/*`

## Environment Variables
- `INARA_API_KEY` — Inara.cz API key (optional, for CMDR sync)
- `FLASK_ENV=production`
