'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getClient } from '../../../lib/clients'
import Nav from '../../../components/Nav'
import { useRouter, useParams } from 'next/navigation'

export default function ClientPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [client, setClient] = useState(null)
  const [tab, setTab] = useState('discover')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { router.push('/'); return }
      setUser(data.user)
      const c = getClient(params.client)
      if (!c) router.push('/dashboard')
      else setClient(c)
    })
  }, [params.client])

  if (!user || !client) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888', fontSize: '14px' }}>Loading...</p>
    </div>
  )

  const tabs = [
    { id: 'discover', label: 'Competitor discovery' },
    { id: 'analyse',  label: 'SortFeed analysis' },
    { id: 'report',   label: 'Weekly report' },
    { id: 'schedule', label: 'Content schedule' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav user={user} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ fontSize: '13px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            ← Dashboard
          </button>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>{client.name}</span>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>{client.name}</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{client.niche}</p>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#e8e6e0', padding: '4px', borderRadius: '12px', width: 'fit-content', marginBottom: '24px', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? '#1a1a1a' : '#666',
                boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'discover'  && <DiscoverTab client={client} />}
        {tab === 'analyse'   && <AnalyseTab  client={client} />}
        {tab === 'report'    && <ReportTab   client={client} />}
        {tab === 'schedule'  && <ScheduleTab client={client} />}

      </div>
    </div>
  )
}

// ── DISCOVER ─────────────────────────────────────────────────────────────────

function DiscoverTab({ client }) {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  async function run() {
    setRunning(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResults(data.results)
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <Card>
        <h2 style={s.cardTitle}>Find top 10 competitors for {client.name}</h2>
        <p style={s.cardDesc}>Scans Instagram hashtags, scores every account out of 100 based on virality and niche match. Returns the 10 best to put through SortFeed.</p>
        <div style={{ background: '#fef9ec', border: '1px solid #f0c040', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#7a5c00' }}>This takes about 15 minutes. Keep this tab open while it runs.</p>
        </div>
        <Btn onClick={run} loading={running} label="Run competitor discovery" />
        {error && <p style={{ color: '#e24b4a', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
      </Card>

      {results && (
        <Card style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Top {results.length} competitors found</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Run these through SortFeed → then use Analysis tab</p>
          </div>
          {results.map((a, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: i < results.length - 1 ? '1px solid #f8f6f2' : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#ddd', width: '28px' }}>#{i+1}</span>
              <div style={{ flex: 1 }}>
                <a href={`https://instagram.com/${a.username}`} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>
                  @{a.username}
                </a>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>{Number(a.followers).toLocaleString()} followers</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>{a.total_score}</div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>/ 100</div>
              </div>
              <div style={{ textAlign: 'right', display: 'none' }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{a.viral_posts} viral posts</div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>best: {Number(a.best_post_views || 0).toLocaleString()} views</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ── ANALYSE ───────────────────────────────────────────────────────────────────

function AnalyseTab({ client }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) setFile(f)
    else setError('Please use a CSV file')
  }

  async function run() {
    if (!file) return
    setRunning(true)
    setError('')
    setResult(null)
    const text = await file.text()
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, csvContent: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.analysis)
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <Card>
        <h2 style={s.cardTitle}>SortFeed analysis for {client.name}</h2>
        <p style={s.cardDesc}>Export a CSV from SortFeed after running your competitors through it. Drop it here — Claude analyses every viral video and sends you a brief.</p>

        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          style={{
            border: `2px dashed ${dragging ? '#7F77DD' : '#e0ddd6'}`,
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            background: dragging ? '#EEEDFE' : '#fafaf8',
            marginBottom: '16px',
            transition: 'all 0.15s',
          }}
        >
          {file ? (
            <div>
              <p style={{ margin: '0 0 6px', fontWeight: 500, fontSize: '14px' }}>{file.name}</p>
              <button onClick={() => setFile(null)} style={{ fontSize: '12px', color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>Drop your SortFeed CSV here</p>
              <label style={{ fontSize: '13px', color: '#7F77DD', fontWeight: 500, cursor: 'pointer' }}>
                or browse files
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
              </label>
            </div>
          )}
        </div>

        {error && <p style={{ color: '#e24b4a', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
        <Btn onClick={run} loading={running} disabled={!file} label="Analyse + send brief to inbox" />
      </Card>

      {result && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '20px 24px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Headline insight</p>
            <p style={{ margin: 0, fontSize: '16px', color: '#fff', fontStyle: 'italic', lineHeight: 1.5 }}>"{result.headline_insight}"</p>
          </div>

          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Do this week</h3>
            {(result.do_this_week || []).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#000', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: 1.5 }}>{a}</p>
              </div>
            ))}
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hook bank — 10 ready to use</h3>
            {(result.hook_bank || []).map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: i < (result.hook_bank.length - 1) ? '1px solid #f4f3ef' : 'none' }}>
                <span style={{ fontSize: '11px', color: '#ccc', fontFamily: 'monospace', width: '20px', flexShrink: 0, paddingTop: '2px' }}>{String(i+1).padStart(2,'0')}</span>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#1a1a1a', lineHeight: 1.4 }}>"{h}"</p>
              </div>
            ))}
          </Card>

          <div style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#085041', fontWeight: 500 }}>Brief also sent to your inbox</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── REPORT ────────────────────────────────────────────────────────────────────

function ReportTab({ client }) {
  const [notes, setNotes] = useState('')
  const [running, setRunning] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function run() {
    setRunning(true)
    setError('')
    setSent(false)
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSent(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card>
      <h2 style={s.cardTitle}>Weekly report for {client.name}</h2>
      <p style={s.cardDesc}>Generates a plain-English summary of this week's content performance and sends it to your inbox.</p>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#444', marginBottom: '6px' }}>Notes for this week (optional)</label>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={4}
        placeholder="e.g. Posted 5 times this week, two skits, one carousel..."
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0ddd6', borderRadius: '8px', fontSize: '13px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', fontFamily: 'inherit' }}
      />
      {error && <p style={{ color: '#e24b4a', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
      {sent && <div style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}><p style={{ margin: 0, fontSize: '13px', color: '#085041', fontWeight: 500 }}>Report sent to your inbox</p></div>}
      <Btn onClick={run} loading={running} label="Generate + send report" />
    </Card>
  )
}

// ── SCHEDULE ──────────────────────────────────────────────────────────────────

function ScheduleTab({ client }) {
  const [posts, setPosts] = useState([
    { day: 'Monday', platform: 'Instagram', type: 'Reel', hook: '' },
    { day: 'Wednesday', platform: 'TikTok', type: 'Reel', hook: '' },
    { day: 'Friday', platform: 'Instagram', type: 'Carousel', hook: '' },
  ])

  function update(i, field, val) {
    setPosts(p => p.map((x, idx) => idx === i ? { ...x, [field]: val } : x))
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ ...s.cardTitle, margin: 0 }}>Schedule for {client.name}</h2>
        <button onClick={() => setPosts(p => [...p, { day: 'Monday', platform: 'Instagram', type: 'Reel', hook: '' }])}
          style={{ fontSize: '13px', color: '#444', border: '1px solid #e0ddd6', background: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
          + Add post
        </button>
      </div>
      {posts.map((post, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '8px', marginBottom: '10px', background: '#fafaf8', borderRadius: '8px', padding: '12px' }}>
          <select value={post.day} onChange={e => update(i, 'day', e.target.value)}
            style={{ padding: '8px', border: '1px solid #e0ddd6', borderRadius: '6px', fontSize: '13px', background: '#fff' }}>
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={post.platform} onChange={e => update(i, 'platform', e.target.value)}
            style={{ padding: '8px', border: '1px solid #e0ddd6', borderRadius: '6px', fontSize: '13px', background: '#fff' }}>
            {['Instagram','TikTok','YouTube Shorts','Facebook'].map(p => <option key={p}>{p}</option>)}
          </select>
          <input value={post.hook} onChange={e => update(i, 'hook', e.target.value)}
            placeholder="Hook / video title..."
            style={{ padding: '8px 10px', border: '1px solid #e0ddd6', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
        </div>
      ))}
      <button style={{ marginTop: '8px', background: '#000', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
        Save schedule
      </button>
    </Card>
  )
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e6e0', padding: '20px 24px', ...style }}>
      {children}
    </div>
  )
}

function Btn({ onClick, loading, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: (loading || disabled) ? '#aaa' : '#000',
        color: '#fff', border: 'none',
        padding: '10px 20px', borderRadius: '8px',
        fontSize: '13px', fontWeight: 500,
        cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
      }}
    >
      {loading && (
        <span style={{ width: '12px', height: '12px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
      )}
      {loading ? 'Running...' : label}
    </button>
  )
}

const s = {
  cardTitle: { fontSize: '16px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 6px' },
  cardDesc:  { fontSize: '13px', color: '#888', margin: '0 0 16px', lineHeight: 1.5 },
}
