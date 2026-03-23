'use client'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Nav({ user }) {
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e8e6e0', padding: '0 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>H</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px', color: '#1a1a1a' }}>Hypnotiic Media</span>
          <span style={{ fontSize: '11px', color: '#888', background: '#f0ede6', padding: '2px 8px', borderRadius: '20px' }}>Internal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>{user?.email}</span>
          <button onClick={signOut} style={{ fontSize: '13px', color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
