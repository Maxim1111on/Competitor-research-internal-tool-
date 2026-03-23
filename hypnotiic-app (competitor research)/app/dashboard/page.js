'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CLIENTS } from '../../lib/clients'
import Nav from '../../components/Nav'
import { useRouter } from 'next/navigation'

const colorMap = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', text: 'text-purple-700' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500',   text: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  text: 'text-green-700'  },
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/')
      else setUser(data.user)
    })
  }, [])

  if (!user) return null

  return (
    <div className="min-h-screen">
      <Nav user={user} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Select a client to run tools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {CLIENTS.map(client => {
            const c = colorMap[client.color]
            return (
              <button
                key={client.id}
                onClick={() => router.push(`/clients/${client.id}`)}
                className={`text-left p-5 rounded-2xl border ${c.bg} ${c.border} hover:shadow-sm transition-all`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${c.text}`}>Active client</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{client.name}</h2>
                <p className="text-xs text-gray-500">{client.niche}</p>
                <div className="mt-4 text-xs text-gray-400">
                  {client.content_pillars.slice(0, 3).join(' · ')}
                </div>
              </button>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Add a new client</h2>
          <p className="text-sm text-gray-500 mb-4">Contact Max to add a new client to the system.</p>
          <a
            href="mailto:max@hypnotiicmedia.com?subject=New client setup"
            className="inline-flex items-center gap-2 text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Request new client
          </a>
        </div>

      </div>
    </div>
  )
}
