import { useEffect, useState } from 'react'
import { Plus, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { listSessions, createTask, runTask, listTasks, type Session, type Task } from '../lib/api'

export default function TasksPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedSession, setSelectedSession] = useState('')
  const [form, setForm] = useState({ name: '', type: 'scrape', target_url: '', instructions: '' })
  const [running, setRunning] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    listSessions().then(s => {
      setSessions(s)
      if (s.length > 0) {
        const active = s.find(x => x.status === 'active')
        const first = active || s[0]
        setSelectedSession(first.id)
        listTasks(first.id).then(setTasks)
      }
    })
  }, [])

  useEffect(() => {
    if (selectedSession) listTasks(selectedSession).then(setTasks)
  }, [selectedSession])

  const handleCreate = async () => {
    if (!selectedSession || !form.name || !form.target_url) return
    const task = await createTask(selectedSession, form.name, form.type, form.target_url, form.instructions)
    setTasks(prev => [task, ...prev])
    setForm({ name: '', type: 'scrape', target_url: '', instructions: '' })
    setShowForm(false)
  }

  const handleRun = async (taskId: string) => {
    setRunning(taskId)
    try {
      const updated = await runTask(taskId)
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
    } finally {
      setRunning(null)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={13} color="var(--accent)" />
      case 'running': return <Clock size={13} color="var(--amber)" />
      case 'failed': return <AlertCircle size={13} color="var(--red)" />
      default: return <Clock size={13} color="var(--text-muted)" />
    }
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>Tasks</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Automated browser tasks with scoring</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* Session selector */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Session:</span>
        <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} style={{ maxWidth: 280 }}>
          {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 16, animation: 'slideIn 0.2s ease-out' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>New Task</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Task name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Scrape homepage" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: '100%' }}>
                <option value="scrape">Scrape</option>
                <option value="navigate">Navigate</option>
                <option value="extract">Extract</option>
                <option value="monitor">Monitor</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Target URL</label>
            <input value={form.target_url} onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))} placeholder="https://example.com" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Instructions (optional)</label>
            <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Extract all product names and prices" rows={2} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleCreate}>Create Task</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tasks table */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Type</th>
              <th>Status</th>
              <th>Score</th>
              <th>Duration</th>
              <th>Target</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No tasks yet.</td></tr>
            )}
            {tasks.map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {statusIcon(t.status)}
                    {t.name}
                  </div>
                </td>
                <td><span className="badge badge-blue">{t.type}</span></td>
                <td>
                  <span className={`badge ${t.status === 'completed' ? 'badge-green' : t.status === 'failed' ? 'badge-red' : t.status === 'running' ? 'badge-amber' : 'badge-gray'}`}>
                    {t.status}
                  </span>
                </td>
                <td>
                  {t.score !== null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 48, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${(t.score * 100).toFixed(0)}%`, height: '100%', background: t.score > 0.7 ? 'var(--accent)' : t.score > 0.4 ? 'var(--amber)' : 'var(--red)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>{(t.score * 100).toFixed(0)}%</span>
                    </div>
                  ) : '—'}
                </td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                  {t.duration_ms ? `${t.duration_ms.toFixed(0)}ms` : '—'}
                </td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                  {t.target_url}
                </td>
                <td>
                  {(t.status === 'pending' || t.status === 'completed') && (
                    <button
                      className="btn-secondary"
                      onClick={() => handleRun(t.id)}
                      disabled={running === t.id}
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      {running === t.id ? '···' : <><Play size={10} /> Run</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
