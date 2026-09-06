'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setEmail(null)
  }

  return (
    <div style={{ padding : '2rem' }}>
      <h1>Workout Tracker</h1>
      {email ? (
        <>
          <p>Logged in as {email}</p>
          <Link href="/log">Log a Set</Link>
          <button onClick={handleLogout}>Log Out</button>
        </> 
      ) : (
        <>
          <p>Not signed in</p>
          <Link href="/signup">Sign Up</Link> | <Link href="/login">Log In</Link>
        </>
      )}
    </div>
  )
}