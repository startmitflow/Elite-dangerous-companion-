import { useState, useEffect } from 'react'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('system')
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('elite-bookmarks')
    if (saved) setBookmarks(JSON.parse(saved))
  }, [])

  function saveBookmarks(updated) {
    setBookmarks(updated)
    localStorage.setItem('elite-bookmarks', JSON.stringify(updated))
  }

  function handleAdd() {
    if (!newName.trim()) return
    saveBookmarks([...bookmarks, {
      id: Date.now(),
      name: newName.trim(),
      type: newType,
      note: newNote.trim(),
      date: new Date().toLocaleDateString(),
    }])
    setNewName('')
    setNewNote('')
  }

  function handleDelete(id) {
    saveBookmarks(bookmarks.filter(b => b.id !== id))
  }

  const grouped = bookmarks.reduce((acc, b) => {
    acc[b.type] = acc[b.type] || []
    acc[b.type].push(b)
    return acc
  }, {})

  return (
    <div>
      <div className="page-header">
        <h2>🔖 Bookmarks</h2>
        <p>Save your favorite systems, stations, and routes</p>
      </div>

      <div className="card">
        <div className="card-title">Add Bookmark</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="System or station name" />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={newType} onChange={e => setNewType(e.target.value)}>
              <option value="system">System</option>
              <option value="station">Station</option>
              <option value="route">Route</option>
              <option value="poi">Point of Interest</option>
            </select>
          </div>
          <div className="form-group">
            <label>Note (optional)</label>
            <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="e.g. Gold route, high demand" />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>Add Bookmark</button>
      </div>

      {bookmarks.length === 0 && (
        <div className="card">
          <div className="empty-state">No bookmarks yet. Add your first one above.</div>
        </div>
      )}

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="card">
          <div className="card-title">{type.charAt(0).toUpperCase() + type.slice(1)}s ({items.length})</div>
          {items.map(b => (
            <div key={b.id} className="bookmark-item">
              <div>
                <div className="name">{b.name}</div>
                <div className="type">{b.note || 'No note'} • {b.date}</div>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(b.id)}>✕</button>
            </div>
          ))}
        </div>
      ))}

      {bookmarks.length > 0 && (
        <div style={{textAlign: 'center', marginTop: 16}}>
          <button className="btn btn-secondary" onClick={() => {
            if (confirm('Delete all bookmarks?')) { saveBookmarks([]) }
          }}>Clear All Bookmarks</button>
        </div>
      )}
    </div>
  )
}
