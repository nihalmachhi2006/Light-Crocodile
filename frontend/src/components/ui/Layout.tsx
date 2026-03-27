import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Globe, Terminal, Cpu, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'


const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/browser', icon: Globe, label: 'Browser' },
  { to: '/sessions', icon: Terminal, label: 'Sessions' },
  { to: '/tasks', icon: Cpu, label: 'Tasks' },
]

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        minWidth: 220,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
      }}>
        {/* Logo */}
        <div style={{ 
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, lineHeight: 1 }}>
            <span style={{ color: '#5bc4d8' }}>Light-</span><span style={{ color: 'var(--text-primary)' }}>Crocodile</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px',
                borderRadius: 6,
                marginBottom: 2,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Sign Out */}
        {user && (
          <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user.user_metadata?.full_name || 'User'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>
            <button 
              onClick={signOut}
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '8px 12px', 
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 13,
                cursor: 'pointer',
                borderRadius: 6,
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(248, 81, 73, 0.1)'
                e.currentTarget.style.color = 'var(--red)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="status-dot active" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Engine running</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            v1.0.0 · httpx+selectolax
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
        <Outlet />
      </main>
    </div>
  )
}
