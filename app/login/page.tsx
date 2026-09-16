'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { data: email, error: lookupError } = await supabase
      .rpc('get_email_for_username', { uname: username })

    if (lookupError || !email) {
      setError('Invalid username or password')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error)
      setError(error.message)
    else
      router.push('/')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <h1>Log In</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Log In</button>
      </form>
    </div>
  )
}