import { useEffect, useState } from 'react'
import { Zap, Globe, Terminal, Cpu, TrendingUp, Clock, Database } from 'lucide-react'
import { getMetrics, listSessions, type Metrics, type Session } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [m, s] = await Promise.all([getMetrics(), listSessions()])
        setMetrics(m)
        setSessions(s)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  const perfData = sessions.slice(0, 20).reverse().map((s, i) => ({
    i,
    memory: s.memory_mb.toFixed(2),
    pages: s.page_count,
  }))

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Real-time browser engine metrics
        </p>
      </div>

      {/* Performance banner */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 16, marginBottom: 28,
      }}>
        <div style={{
          background: 'var(--accent-glow)',
          border: '1px solid var(--accent)',
          borderRadius: 14, padding: '28px 32px',
          display: 'flex', alignItems: 'center', gap: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, var(--accent-glow) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: 'var(--accent)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px var(--accent-glow)',
          }}>
            <Zap size={28} color="#000" fill="#000" />
          </div>
          <div>
            <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--accent)', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>11×</div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>faster than Chrome</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>~50ms vs ~2,000ms startup</div>
          </div>
        </div>
        <div style={{
          background: '#58a6ff18',
          border: '1px solid #58a6ff40',
          borderRadius: 14, padding: '28px 32px',
          display: 'flex', alignItems: 'center', gap: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #58a6ff10 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: '#58a6ff30', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px #58a6ff20',
          }}>
            <Database size={28} color="var(--blue)" />
          </div>
          <div>
            <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--blue)', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>9×</div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>less memory than Chrome</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>~20MB vs ~200MB per session</div>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Sessions', value: metrics?.total_sessions ?? '—', icon: Terminal, color: '#22c55e' },
          { label: 'Active Sessions', value: metrics?.active_sessions ?? '—', icon: Globe, color: '#58a6ff' },
          { label: 'Pages Fetched', value: metrics?.total_pages_fetched ?? '—', icon: TrendingUp, color: '#d29922' },
          { label: 'Avg Load Time', value: metrics ? `${metrics.avg_load_time_ms}ms` : '—', icon: Clock, color: '#f85149' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              <Icon size={14} color={color} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
              {loading ? <span style={{ color: 'var(--border)' }}>···</span> : value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 16 }}>Memory usage per session (MB)</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={perfData}>
              <XAxis dataKey="i" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-muted)' }}
              />
              <Line type="monotone" dataKey="memory" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 16 }}>Pages per session</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={perfData}>
              <XAxis dataKey="i" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="pages" stroke="var(--blue)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Recent Sessions</span>
          <a href="/sessions" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</a>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Pages</th>
              <th>Memory</th>
              <th>Current URL</th>
            </tr>
          </thead>
          <tbody>
            {sessions.slice(0, 8).map(s => (
              <tr key={s.id}>
                <td>
                  <a href={`/sessions/${s.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                    {s.name}
                  </a>
                </td>
                <td>
                  <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    {s.status}
                  </span>
                </td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{s.page_count}</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{s.memory_mb.toFixed(2)}MB</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                  {s.current_url || '—'}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && !loading && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No sessions yet. Create one in the Browser tab.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
