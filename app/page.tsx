'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/sidebar'
import Link from 'next/link'

type Workout = {
  id: number
  date: string
  name: string | null
  logged_sets: {
    id: number
    weight: number
    reps: number
    exercises: { name: string } | null
  }[]
}

export default function Home() {
  const [email, setEmail] = useState<string | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
  })

  supabase
    .from('logged_workouts')
    .select('id, date, name, logged_sets(id, weight, reps, exercises(name))')
    .order('date', { ascending: false})
    .limit(3)
    .then(({ data }) => {
      if (data) setWorkouts(data as unknown as Workout[])
    })
}, [])

  return (
    <div style={{ display : 'flex' }}>
      <Sidebar />
      <div style={{ padding: '2rem', flex: 1 }}>
        {email ? <h1>Hello, {email}!</h1> : <h1>You are not signed in.</h1>}

        <h2>Recent Workouts</h2>
        {workouts.length === 0 && <p>No recent workouts. Add a workout using the sidebar.</p>}
        {workouts.map((w) => (
          <div key={w.id} style={{ border: '1px solid #333', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', maxWidth: '400px'}}>
            <p>{new Date(w.date).toLocaleDateString()}</p>
            <h3>{w.name ?? 'Untitled'}</h3>
            {w.logged_sets.map((s) => (
              <p key={s.id}>
                {s.exercises?.name ?? 'Unknown exercise'} - {s.weight}lbs - {s.reps} reps
              </p>
            ))}
          </div>
        ))}
        <p><Link href="/history">See all</Link></p>

        <h2>Upcoming Workouts</h2>
        <p>No upcoming workouts. Add a workout using the sidebar.</p>
      </div>
    </div>
  )
}