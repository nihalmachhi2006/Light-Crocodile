import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Database, Zap, Cpu, Terminal, Layers, Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleCTA = () => {
    if (user) navigate('/dashboard')
    else navigate('/login')
  }

  const memoryData = [
    { name: 'Chrome (Puppeteer)', value: 200, fill: '#334155' },
    { name: 'Light-Crocodile', value: 20, fill: '#58a6ff' },
  ]

  const startupData = [
    { name: 'Chrome (Puppeteer)', value: 2000, fill: '#334155' },
    { name: 'Light-Crocodile', value: 50, fill: '#22c55e' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#c9d1d9', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Navigation */}
      <nav style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#5bc4d8' }}>Light-</span><span style={{ color: '#ffffff' }}>Crocodile</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button 
            onClick={handleCTA}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            {user ? 'Dashboard' : 'Sign Up'}
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section style={{ paddingTop: 160, paddingBottom: 80, textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '80vh', background: 'radial-gradient(ellipse at top, rgba(91, 196, 216, 0.15) 0%, rgba(13, 17, 23, 0) 70%)', pointerEvents: 'none', zIndex: 0 }} />
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em', color: '#fff' }}>
              The browser built for <span style={{ background: 'linear-gradient(135deg, #5bc4d8, #58a6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI agents</span><br/>not humans.
            </h1>
            <p style={{ fontSize: 22, color: '#8b949e', maxWidth: 760, margin: '0 auto', marginBottom: 48, lineHeight: 1.5 }}>
              A purpose-built, containerized environment that strips out Chromium bloat. Fetch pages instantly, extract cleanly, and scale infinitely without melting your servers.
            </p>
            
            <button 
              onClick={handleCTA}
              style={{ padding: '18px 40px', fontSize: 18, fontWeight: 600, borderRadius: 12, background: 'linear-gradient(135deg, #5bc4d8 0%, #58a6ff 100%)', color: '#000', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 32px rgba(91, 196, 216, 0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(91, 196, 216, 0.4)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(91, 196, 216, 0.3)' }}
            >
              Start Automating <ArrowRight size={20} />
            </button>
          </motion.div>
        </section>

        {/* Dashboard Mockup (CSS) */}
        <section style={{ paddingBottom: 120, position: 'relative', zIndex: 2 }}>
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            style={{ maxWidth: 1000, margin: '0 auto', background: '#161b22', borderRadius: 16, border: '1px solid #30363d', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden' }}
          >
            {/* Mac Window Header */}
            <div style={{ background: '#21262d', padding: '12px 16px', display: 'flex', gap: 8, borderBottom: '1px solid #30363d' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
            </div>
            
            {/* Fake Dashboard Content */}
            <div style={{ display: 'flex', height: 500 }}>
              <div style={{ width: 220, borderRight: '1px solid #30363d', background: '#0d1117', padding: '24px 16px' }}>
                 <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 32, paddingLeft: 8 }}><span style={{ color: '#5bc4d8' }}>Light-</span>Crocodile</div>
                 <div style={{ background: 'rgba(91, 196, 216, 0.1)', color: '#5bc4d8', padding: '10px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}><Layers size={16}/> Dashboard</div>
                 <div style={{ color: '#8b949e', padding: '10px 12px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}><Globe size={16}/> Browser</div>
                 <div style={{ color: '#8b949e', padding: '10px 12px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}><Terminal size={16}/> Sessions</div>
              </div>
              <div style={{ flex: 1, padding: 32, background: '#0d1117' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24, fontFamily: "'Space Grotesk', sans-serif" }}>Dashboard</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                   <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: 24, borderRadius: 12 }}>
                     <div style={{ color: '#22c55e', fontSize: 36, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>11×</div>
                     <div style={{ color: '#c9d1d9', fontSize: 14, marginTop: 8, fontWeight: 500 }}>faster than Chrome</div>
                     <div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>~50ms vs ~2,000ms startup</div>
                   </div>
                   <div style={{ background: 'rgba(88, 166, 255, 0.05)', border: '1px solid rgba(88, 166, 255, 0.3)', padding: 24, borderRadius: 12 }}>
                     <div style={{ color: '#58a6ff', fontSize: 36, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>9×</div>
                     <div style={{ color: '#c9d1d9', fontSize: 14, marginTop: 8, fontWeight: 500 }}>less memory than Chrome</div>
                     <div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>~20MB vs ~200MB per session</div>
                   </div>
                </div>
                <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, height: 180, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 16, left: 16, fontSize: 14, color: '#8b949e', fontWeight: 500 }}>Live Active Sessions</div>
                  {/* Fake graph lines */}
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0 }}>
                    <path d="M0,80 Q20,20 40,60 T80,40 T100,50 L100,100 L0,100 Z" fill="rgba(91, 196, 216, 0.1)" />
                    <path d="M0,80 Q20,20 40,60 T80,40 T100,50" fill="none" stroke="#5bc4d8" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Data & Graphs Section */}
        <section style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 160 }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 16 }}>The numbers don't lie.</h2>
            <p style={{ fontSize: 18, color: '#8b949e', maxWidth: 600, margin: '0 auto' }}>Chrome was built to render pixels for humans. We removed the rendering pipeline entirely.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 40 }}>
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 16, padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Memory Usage (MB)</h3>
              <p style={{ fontSize: 14, color: '#8b949e', marginBottom: 32 }}>Per isolated browser session</p>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memoryData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" stroke="#8b949e" width={140} tick={{ fontSize: 12, fill: '#8b949e' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} label={{ position: 'right', fill: '#fff', fontSize: 14, fontWeight: 600, formatter: (v: number) => `${v}MB` }}>
                      {memoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 16, padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Startup Time (ms)</h3>
              <p style={{ fontSize: 14, color: '#8b949e', marginBottom: 32 }}>Time to cold-start a new session</p>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={startupData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" stroke="#8b949e" width={140} tick={{ fontSize: 12, fill: '#8b949e' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} label={{ position: 'right', fill: '#fff', fontSize: 14, fontWeight: 600, formatter: (v: number) => `${v}ms` }}>
                      {startupData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem / Solution Grid */}
        <section style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 160 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 48, textAlign: 'center' }}>Why Puppeteer & Playwright fail at scale</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {[
              { title: 'Built for rendering, not API response', desc: '90% of Chrome\'s codebase is dedicated to painting pixels you never see. Light-Crocodile only parses what matters: structured JSON data from the DOM.', icon: Globe, color: '#f85149' },
              { title: 'Shared state risk', desc: 'Running concurrent tasks in Chrome profiles often leaks cookies and local storage. We isolate every single request entirely.', icon: Shield, color: '#d29922' },
              { title: 'Missing API Primitives', desc: 'Traditional headless browsers lack clean observe()/act() methods for RL agents. We output standardized Agent-Compatible JSON.', icon: Cpu, color: '#a371f7' },
              { title: 'Massive Resource Burn', desc: 'Running 50 separate Playwright instances demands 10GB+ of RAM. With Light-Crocodile, you can run 500 agents on a standard VPS.', icon: Database, color: '#58a6ff' },
            ].map((prop, i) => (
              <div key={i} style={{ padding: 32, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                <prop.icon size={28} color={prop.color} style={{ marginBottom: 20 }} />
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>{prop.title}</h3>
                <p style={{ color: '#8b949e', fontSize: 15, lineHeight: 1.6 }}>{prop.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Terminal Comparison CTA */}
        <section style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 160, textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)', border: '1px solid #30363d', borderRadius: 24, padding: '64px 40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(88, 166, 255, 0.1) 0%, transparent 70%)' }} />
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 700, color: '#fff', marginBottom: 20, position: 'relative', zIndex: 1 }}>Ready to shed the chromium bloat?</h2>
            <p style={{ fontSize: 18, color: '#8b949e', marginBottom: 40, position: 'relative', zIndex: 1 }}>Sign up to start provisioning your AI browser endpoints instantly.</p>
            <button 
              onClick={handleCTA}
              style={{ position: 'relative', zIndex: 1, padding: '16px 40px', fontSize: 16, fontWeight: 600, borderRadius: 12, background: '#fff', color: '#000', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 8px 32px rgba(255,255,255,0.1)' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Get Started for Free
            </button>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid #30363d', padding: '40px 24px', textAlign: 'center', color: '#8b949e', fontSize: 14 }}>
        <p>© 2026 Light-Crocodile. Open source, built for agents.</p>
      </footer>
    </div>
  )
}
