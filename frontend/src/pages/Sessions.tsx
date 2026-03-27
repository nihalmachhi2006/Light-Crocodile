import { useEffect, useState } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { listSessions, createSession, closeSession, type Session } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = async () => {
    const data = await listSessions()
    setSessions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    const s = await createSession(`Session ${new Date().toLocaleTimeString()}`)
    setSessions(prev => [s, ...prev])
  }

  const handleClose = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await closeSession(id)
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'closed' } : s))
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>Sessions</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {sessions.filter(s => s.status === 'active').length} active · {sessions.length} total
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={14} /> New Session
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Pages</th>
              <th>Requests</th>
              <th>Memory</th>
              <th>Current URL</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading…</td></tr>
            )}
            {!loading && sessions.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No sessions yet.</td></tr>
            )}
            {sessions.map(s => (
              <tr key={s.id} onClick={() => navigate(`/sessions/${s.id}`)} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td>
                  <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    {s.status === 'active' && <span className="status-dot active" style={{ width: 5, height: 5 }} />}
                    {s.status}
                  </span>
                </td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{s.page_count}</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{s.requests_count}</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--accent)' }}>{s.memory_mb.toFixed(2)}MB</td>
                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                  {s.current_url || '—'}
                </td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(s.created_at).toLocaleString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-secondary" onClick={e => { e.stopPropagation(); navigate(`/sessions/${s.id}`) }} style={{ padding: '4px 8px', fontSize: 11 }}>
                      <ExternalLink size={11} />
                    </button>
                    {s.status === 'active' && (
                      <button className="btn-danger" onClick={e => handleClose(s.id, e)} style={{ padding: '4px 8px', fontSize: 11 }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
