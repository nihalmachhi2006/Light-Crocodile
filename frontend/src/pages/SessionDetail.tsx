import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Clock, Database } from 'lucide-react'
import { listPages, type Page } from '../lib/api'
import axios from 'axios'

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [pages, setPages] = useState<Page[]>([])

  useEffect(() => {
    if (!id) return
    axios.get(`/api/sessions/${id}`).then(r => setSession(r.data))
    listPages(id).then(setPages)
  }, [id])

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1000 }}>
      <button className="btn-secondary" onClick={() => navigate('/sessions')} style={{ marginBottom: 20, fontSize: 12 }}>
        <ArrowLeft size={13} /> Back
      </button>

      {session && (
        <>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>{session.name}</h1>
              <span className={`badge ${session.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{session.status}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{id}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Pages', value: session.page_count, icon: Globe, color: 'var(--accent)' },
              { label: 'Requests', value: session.requests_count, icon: Globe, color: 'var(--blue)' },
              { label: 'Memory', value: `${session.memory_mb.toFixed(2)}MB`, icon: Database, color: 'var(--amber)' },
              { label: 'Created', value: new Date(session.created_at).toLocaleTimeString(), icon: Clock, color: 'var(--text-secondary)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="metric-card">
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                  {label} <Icon size={12} color={color} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 500 }}>
          Page History ({pages.length})
        </div>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Title</th>
              <th>Status</th>
              <th>Load time</th>
              <th>Memory</th>
              <th>Elements</th>
              <th>Fetched</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(p => (
              <tr key={p.id}>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{p.url}</td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || '—'}</td>
                <td>
                  <span className={`badge ${p.status_code && p.status_code < 400 ? 'badge-green' : 'badge-red'}`}>
                    {p.status_code || 'ERR'}
                  </span>
                </td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--accent)' }}>{p.load_time_ms?.toFixed(0)}ms</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{p.memory_mb?.toFixed(3)}MB</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{p.elements_count ?? '—'}</td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleTimeString()}</td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>No pages fetched in this session.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
