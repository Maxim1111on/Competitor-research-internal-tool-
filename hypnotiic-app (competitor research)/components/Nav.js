'use client'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Nav({ user }) {
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-gray-900">Hypnotiic Media</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Internal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
