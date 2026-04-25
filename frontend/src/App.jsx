import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'

// ─── Pages ───────────────────────────────────────────────────────────────────
import TradeSearch from './pages/TradeSearch'
import StationAdvisor from './pages/StationAdvisor'
import SystemSearch from './pages/SystemSearch'
import RoutePlanner from './pages/RoutePlanner'
import CommoditySearch from './pages/CommoditySearch'
import CommanderDashboard from './pages/CommanderDashboard'
import Colonies from './pages/Colonies'
import Ships from './pages/Ships'
import Materials from './pages/Materials'
import Bookmarks from './pages/Bookmarks'
import Settings from './pages/Settings'

// ─── Navigation Items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/',          label: 'Trade Search',        icon: 'T', section: 'Trade & Station' },
  { path: '/station',   label: 'Station Advisor',    icon: 'S', section: 'Trade & Station' },
  { path: '/system',    label: 'System Search',      icon: 'G', section: 'Trade & Station' },
  { path: '/route',     label: 'Route Planner',      icon: 'R', section: 'Trade & Station' },
  { path: '/commodity', label: 'Commodity Search',   icon: 'C', section: 'Trade & Station' },
  { divider: true },
  { path: '/commander', label: 'Commander Dashboard', icon: 'D', section: 'Commander' },
  { path: '/ships',     label: 'Ships',               icon: 'H', section: 'Commander' },
  { path: '/materials', label: 'Materials',           icon: 'M', section: 'Commander' },
  { divider: true },
  { path: '/colonies',  label: 'Colonies',            icon: 'O', section: 'Tools' },
  { path: '/bookmarks', label: 'Bookmarks',           icon: 'B', section: 'Tools' },
  { path: '/settings',  label: 'Settings',            icon: '⚙', section: 'Tools' },
]

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ mobileOpen, onClose }) {
  let lastSection = ''
  return (
    <nav className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1>⚔ Elite Companion</h1>
        <span>by StartMit</span>
      </div>
      <div className="nav-section">
        {NAV_ITEMS.map((item, i) =>
          item.divider ? (
            <div key={`div-${i}`} className="nav-divider" />
          ) : (
            <>
              {item.section !== lastSection && (
                <div key={`sec-${i}`} className="nav-section-title">{item.section}</div>
              )}
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
                end={item.path === '/'}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </NavLink>
              {(lastSection = item.section)}
            </>
          )
        )}
      </div>
    </nav>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="app-layout">
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="main-content">
          <Routes>
            <Route path="/"                    element={<TradeSearch />} />
            <Route path="/station"            element={<StationAdvisor />} />
            <Route path="/system"             element={<SystemSearch />} />
            <Route path="/route"              element={<RoutePlanner />} />
            <Route path="/commodity"           element={<CommoditySearch />} />
            <Route path="/commander"          element={<CommanderDashboard />} />
            <Route path="/colonies"            element={<Colonies />} />
            <Route path="/ships"               element={<Ships />} />
            <Route path="/materials"           element={<Materials />} />
            <Route path="/bookmarks"           element={<Bookmarks />} />
            <Route path="/settings"            element={<Settings />} />
            <Route path="*"                   element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
