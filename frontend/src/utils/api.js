// Shared API utility for Elite Companion

const BASE = '/api'

async function apiFetch(path, params = {}) {
  const url = new URL(BASE + path, window.location.origin)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  searchSystem: (name) => apiFetch('/system/' + encodeURIComponent(name)),
  getStations: (system) => apiFetch('/stations/' + encodeURIComponent(system)),
  getMarket: (system, station) => apiFetch('/market/' + encodeURIComponent(system) + '/' + encodeURIComponent(station)),
  searchCommodity: (name) => apiFetch('/commodity/' + encodeURIComponent(name)),
  galaxySearch: (q) => apiFetch('/galaxy/search', { q }),
  route: (from, to, jumps) => apiFetch('/route', { from, to, jumps }),
  inaraCmdr: (name) => apiFetch('/inara/cmdr/' + encodeURIComponent(name)),
  inaraShips: (cmdr) => apiFetch('/inara/ships/' + encodeURIComponent(cmdr)),
  inaraMaterials: (cmdr) => apiFetch('/inara/materials/' + encodeURIComponent(cmdr)),
  colonies: (system) => apiFetch('/colonies/' + encodeURIComponent(system)),
  health: () => apiFetch('/health'),
}
