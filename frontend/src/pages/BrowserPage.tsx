import { useState, useEffect, useRef } from 'react'
import { Globe, Plus, Send, ExternalLink, Link, MousePointer, Type, ChevronRight } from 'lucide-react'
import {
  createSession, listSessions, fetchPage,
  type Session, type Page
} from '../lib/api'

export default function BrowserPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [url, setUrl] = useState('https://example.com')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [history, setHistory] = useState<Page[]>([])
  const [error, setError] = useState<string | null>(null)
  const urlRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listSessions().then(s => {
      setSessions(s)
      const active = s.find(x => x.status === 'active')
      if (active) setActiveSession(active)
    })
  }, [])

  const handleNewSession = async () => {
    const s = await createSession(`Session ${Date.now()}`)
    setSessions(prev => [s, ...prev])
    setActiveSession(s)
  }

  const handleFetch = async (targetUrl?: string) => {
    const fetchUrl = targetUrl || url
    if (!fetchUrl.trim()) return
    if (!activeSession) {
      const s = await createSession()
      setSessions(prev => [s, ...prev])
      setActiveSession(s)
      await doFetch(s.id, fetchUrl)
      return
    }
    await doFetch(activeSession.id, fetchUrl)
  }

  const doFetch = async (sessionId: string, fetchUrl: string) => {
    let finalUrl = fetchUrl
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }
    setLoading(true)
    setError(null)
    try {
      const page = await fetchPage(sessionId, finalUrl)
      setCurrentPage(page)
      setHistory(prev => [page, ...prev.slice(0, 19)])
      setUrl(finalUrl)
      // Refresh session
      const updated = await listSessions()
      setSessions(updated)
      const upd = updated.find(x => x.id === sessionId)
      if (upd) setActiveSession(upd)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to fetch page')
    } finally {
      setLoading(false)
    }
  }

  const elementTypeIcon = (type: string) => {
    switch (type) {
      case 'link': return <Link size={11} />
      case 'button': return <MousePointer size={11} />
      case 'input': return <Type size={11} />
      default: return <ChevronRight size={11} />
    }
  }

  const elementBadge = (type: string) => {
    switch (type) {
      case 'link': return 'badge-blue'
      case 'button': return 'badge-green'
      case 'input': return 'badge-amber'
      default: return 'badge-gray'
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left panel - session + history */}
      <div style={{
        width: 260, minWidth: 260,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Session selector */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Session</span>
            <button onClick={handleNewSession} className="btn-secondary" style={{ padding: '3px 8px', fontSize: 11, gap: 4 }}>
              <Plus size={10} /> New
            </button>
          </div>
          <select
            value={activeSession?.id || ''}
            onChange={e => {
              const s = sessions.find(x => x.id === e.target.value)
              if (s) setActiveSession(s)
            }}
            style={{ width: '100%', fontSize: 12 }}
          >
            <option value="">— No session —</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.page_count} pages)
              </option>
            ))}
          </select>
          {activeSession && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 5, padding: '6px 8px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Pages</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{activeSession.page_count}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 5, padding: '6px 8px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Memory</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>{activeSession.memory_mb.toFixed(1)}MB</div>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div style={{ flex: 1, overflow: 'auto', padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 4 }}>History</div>
          {history.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 8px', color: 'var(--text-muted)', fontSize: 12 }}>
              No pages fetched yet
            </div>
          )}
          {history.map(p => (
            <div
              key={p.id}
              onClick={() => { setCurrentPage(p); setUrl(p.url) }}
              style={{
                padding: '8px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 2,
                background: currentPage?.id === p.id ? 'var(--accent-glow)' : 'transparent',
                border: currentPage?.id === p.id ? '1px solid #22c55e30' : '1px solid transparent',
                transition: 'all 0.1s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Globe size={10} color="var(--text-muted)" />
                <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {p.title || 'Untitled'}
                </span>
                <span className={`badge ${p.status_code && p.status_code < 400 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 9, padding: '1px 4px' }}>
                  {p.status_code || 'ERR'}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>
                {p.url.replace(/^https?:\/\//, '')}
              </div>
              {p.load_time_ms && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {p.load_time_ms.toFixed(0)}ms · {p.memory_mb?.toFixed(2)}MB
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main browser area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* URL bar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <Globe size={14} color="var(--text-muted)" style={{ marginLeft: 10, flexShrink: 0 }} />
            <input
              ref={urlRef}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="https://example.com"
              style={{ border: 'none', background: 'transparent', padding: '8px 10px', flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
            />
          </div>
          <button
            onClick={() => handleFetch()}
            disabled={loading}
            className="btn-primary"
            style={{ minWidth: 80 }}
          >
            {loading ? (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>···</span>
            ) : (
              <><Send size={13} /> Fetch</>
            )}
          </button>
        </div>

        {error && (
          <div style={{ margin: '12px 16px', padding: '10px 14px', background: '#f8514910', border: '1px solid #f8514930', borderRadius: 6, fontSize: 12, color: 'var(--red)' }}>
            {error}
          </div>
        )}

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {!currentPage && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 12 }}>
              <Globe size={40} color="var(--border)" />
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Enter a URL and press Fetch</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No Chromium. No Puppeteer. Just pure speed.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['https://example.com', 'https://httpbin.org/get', 'https://jsonplaceholder.typicode.com'].map(u => (
                  <button key={u} onClick={() => { setUrl(u); handleFetch(u) }} className="btn-secondary" style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    {u.replace('https://', '')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentPage && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, maxWidth: 1100 }}>
              {/* Left: page content */}
              <div>
                {/* Page header */}
                <div className="card" style={{ padding: '14px 18px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {currentPage.title || 'Untitled Page'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 6 }}>
                        {currentPage.url}
                        <a href={currentPage.url} target="_blank" rel="noreferrer">
                          <ExternalLink size={10} color="var(--text-muted)" />
                        </a>
                      </div>
                    </div>
                    <span className={`badge ${currentPage.status_code && currentPage.status_code < 400 ? 'badge-green' : 'badge-red'}`}>
                      {currentPage.status_code || 'ERROR'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[
                      { label: 'Load time', value: `${currentPage.load_time_ms?.toFixed(0)}ms`, color: 'var(--accent)' },
                      { label: 'Memory', value: `${currentPage.memory_mb?.toFixed(3)}MB`, color: 'var(--blue)' },
                      { label: 'Elements', value: currentPage.elements_count ?? 0, color: 'var(--text-secondary)' },
                      { label: 'Links', value: currentPage.links_count ?? 0, color: 'var(--text-secondary)' },
                      { label: 'Size', value: currentPage.content_length ? `${(currentPage.content_length / 1024).toFixed(1)}KB` : '—', color: 'var(--text-secondary)' },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text content */}
                <div className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                    Extracted text content
                  </div>
                  <div style={{
                    fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)',
                    maxHeight: 300, overflow: 'auto',
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {currentPage.observation?.text_content || 'No text content extracted.'}
                  </div>
                </div>
              </div>

              {/* Right: interactive elements + links */}
              <div>
                {/* Interactive elements */}
                <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Interactive elements ({currentPage.observation?.interactive_elements.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 260, overflow: 'auto' }}>
                    {currentPage.observation?.interactive_elements.map(el => (
                      <div key={el.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 8px', borderRadius: 5,
                        background: 'var(--bg-primary)',
                        cursor: el.type === 'link' && el.href ? 'pointer' : 'default',
                      }}
                        onClick={() => el.type === 'link' && el.href && handleFetch(el.href)}
                      >
                        <span className={`badge ${elementBadge(el.type)}`} style={{ gap: 3, fontSize: 9 }}>
                          {elementTypeIcon(el.type)}
                          {el.type}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {el.text || el.placeholder || el.id}
                        </span>
                      </div>
                    ))}
                    {!currentPage.observation?.interactive_elements.length && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>No interactive elements found</div>
                    )}
                  </div>
                </div>

                {/* Links */}
                <div className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Links ({currentPage.observation?.links.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 260, overflow: 'auto' }}>
                    {currentPage.observation?.links.slice(0, 20).map((link, i) => (
                      <div
                        key={i}
                        onClick={() => handleFetch(link.href)}
                        style={{
                          padding: '5px 8px', borderRadius: 5, cursor: 'pointer',
                          background: 'var(--bg-primary)',
                          transition: 'background 0.1s',
                        }}
                      >
                        <div style={{ fontSize: 11, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {link.text || '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>
                          {link.href.replace(/^https?:\/\//, '')}
                        </div>
                      </div>
                    ))}
                    {!currentPage.observation?.links.length && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>No links found</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
