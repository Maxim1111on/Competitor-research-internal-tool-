'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { getClient } from '../../../lib/clients'
import Nav from '../../../components/Nav'
import { useRouter, useParams } from 'next/navigation'

export default function ClientPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [client, setClient] = useState(null)
  const [activeTab, setActiveTab] = useState('discover')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/'); return }
      setUser(data.user)
      const c = getClient(params.client)
      if (!c) { router.push('/dashboard'); return }
      setClient(c)
    })
  }, [params.client])

  if (!user || !client) return null

  const tabs = [
    { id: 'discover', label: 'Competitor discovery' },
    { id: 'analyse',  label: 'SortFeed analysis' },
    { id: 'report',   label: 'Weekly report' },
    { id: 'schedule', label: 'Content schedule' },
  ]

  return (
    <div className="min-h-screen">
      <Nav user={user} />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600">
            ← Dashboard
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">{client.name}</span>
        </div>

        <div className="flex items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{client.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{client.niche}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'discover'  && <DiscoverTab client={client} />}
        {activeTab === 'analyse'   && <AnalyseTab  client={client} />}
        {activeTab === 'report'    && <ReportTab   client={client} />}
        {activeTab === 'schedule'  && <ScheduleTab client={client} />}

      </div>
    </div>
  )
}


// ── DISCOVER TAB ─────────────────────────────────────────────────────────────

function DiscoverTab({ client }) {
  const [running, setRunning]   = useState(false)
  const [results, setResults]   = useState(null)
  const [logs, setLogs]         = useState([])
  const [error, setError]       = useState('')
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  async function runDiscovery() {
    setRunning(true)
    setResults(null)
    setError('')
    setLogs(['Starting competitor discovery for ' + client.name + '...'])

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Discovery failed')
      setResults(data.results)
      setLogs(prev => [...prev, 'Done — ' + data.results.length + ' competitors found'])
    } catch (e) {
      setError(e.message)
      setLogs(prev => [...prev, 'Error: ' + e.message])
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Find top 10 competitors</h2>
        <p className="text-sm text-gray-500 mb-4">
          Scans Instagram for accounts in {client.name}'s niche, scores each out of 100 based on virality,
          niche match, and content quality. Returns the 10 best to run through SortFeed.
        </p>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          This takes about 15 minutes to run. Keep this tab open.
        </p>
        <button
          onClick={runDiscovery}
          disabled={running}
          className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {running && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {running ? 'Running...' : 'Run discovery'}
        </button>
      </div>

      {logs.length > 0 && (
        <div ref={logRef} className="bg-gray-900 rounded-xl p-4 h-32 overflow-y-auto">
          {logs.map((log, i) => (
            <p key={i} className="text-xs text-green-400 font-mono">{log}</p>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Top {results.length} competitors</h3>
            <p className="text-xs text-gray-400">Run these through SortFeed then use the Analysis tab</p>
          </div>
          <div className="divide-y divide-gray-50">
            {results.map((account, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <span className="text-lg font-bold text-gray-200 w-8 text-center">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://instagram.com/${account.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                    >
                      @{account.username}
                    </a>
                    <span className="text-xs text-gray-400">{Number(account.followers).toLocaleString()} followers</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{account.bio}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-gray-900">{account.total_score}</div>
                  <div className="text-xs text-gray-400">/ 100</div>
                </div>
                <div className="text-right flex-shrink-0 hidden md:block">
                  <div className="text-sm font-medium text-gray-700">{account.viral_posts} viral posts</div>
                  <div className="text-xs text-gray-400">best: {Number(account.best_post_views).toLocaleString()} views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


// ── ANALYSE TAB ───────────────────────────────────────────────────────────────

function AnalyseTab({ client }) {
  const [file, setFile]         = useState(null)
  const [dragging, setDragging] = useState(false)
  const [running, setRunning]   = useState(false)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState('')

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith('.csv')) setFile(dropped)
    else setError('Please drop a CSV file')
  }

  async function runAnalysis() {
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
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data.analysis)
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">SortFeed analysis</h2>
        <p className="text-sm text-gray-500 mb-4">
          Export a CSV from SortFeed after running your top 10 competitors through it.
          Drop it here and Claude will analyse all the viral content and send you a brief.
        </p>

        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragging ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {file ? (
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <button onClick={() => setFile(null)} className="text-xs text-gray-400 hover:text-gray-600 mt-1">
                Remove
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500">Drop your SortFeed CSV here</p>
              <p className="text-xs text-gray-400 mt-1">or</p>
              <label className="mt-2 inline-block cursor-pointer text-sm text-purple-600 font-medium hover:text-purple-800">
                Browse files
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={e => setFile(e.target.files[0])}
                />
              </label>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <button
          onClick={runAnalysis}
          disabled={!file || running}
          className="mt-4 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {running && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {running ? 'Analysing...' : 'Run analysis + send brief'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-black rounded-2xl p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Headline insight</p>
            <p className="text-white text-lg font-medium leading-relaxed">"{result.headline_insight}"</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Do this week</h3>
            <div className="space-y-3">
              {(result.do_this_week || []).map((action, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</div>
                  <p className="text-sm text-gray-700">{action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Hook bank — 10 ready to use</h3>
            <div className="space-y-2">
              {(result.hook_bank || []).map((hook, i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-300 font-mono w-5 flex-shrink-0 mt-0.5">{String(i+1).padStart(2,'0')}</span>
                  <p className="text-sm text-gray-900 font-medium">"{hook}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-purple-700 font-medium">Brief also sent to your inbox</p>
          </div>
        </div>
      )}
    </div>
  )
}


// ── REPORT TAB ────────────────────────────────────────────────────────────────

function ReportTab({ client }) {
  const [running, setRunning] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const [notes, setNotes]     = useState('')

  async function generateReport() {
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
      if (!res.ok) throw new Error(data.error || 'Report failed')
      setSent(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">Weekly performance report</h2>
      <p className="text-sm text-gray-500">
        Generates a plain-English summary of {client.name}'s content performance this week
        and emails it to the client automatically.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes for this week (optional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
          placeholder="e.g. We launched two skit videos this week, client posted 5x..."
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {sent && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-sm text-green-700 font-medium">Report sent to your inbox</p>
        </div>
      )}
      <button
        onClick={generateReport}
        disabled={running}
        className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {running && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {running ? 'Generating...' : 'Generate + send report'}
      </button>
    </div>
  )
}


// ── SCHEDULE TAB ─────────────────────────────────────────────────────────────

function ScheduleTab({ client }) {
  const [posts, setPosts] = useState([
    { day: 'Monday', platform: 'Instagram', type: 'Reel', hook: '', notes: '' },
    { day: 'Wednesday', platform: 'TikTok', type: 'Reel', hook: '', notes: '' },
    { day: 'Friday', platform: 'Instagram', type: 'Carousel', hook: '', notes: '' },
  ])

  function updatePost(i, field, value) {
    setPosts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function addPost() {
    setPosts(prev => [...prev, { day: 'Monday', platform: 'Instagram', type: 'Reel', hook: '', notes: '' }])
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Content schedule for {client.name}</h2>
          <button
            onClick={addPost}
            className="text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            + Add post
          </button>
        </div>

        <div className="space-y-3">
          {posts.map((post, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl">
              <select
                value={post.day}
                onChange={e => updatePost(i, 'day', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
              >
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <select
                value={post.platform}
                onChange={e => updatePost(i, 'platform', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
              >
                {['Instagram','TikTok','YouTube Shorts','Facebook'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <input
                value={post.hook}
                onChange={e => updatePost(i, 'hook', e.target.value)}
                placeholder="Hook / title..."
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none md:col-span-2"
              />
            </div>
          ))}
        </div>

        <button className="mt-4 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          Save schedule
        </button>
      </div>
    </div>
  )
}
