'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDateForDisplay } from '@/lib/date'
import Link from 'next/link'
import AppShell from '@/components/AppShell'

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

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    // Read workout data associated with user
    supabase
      .from('logged_workouts')
      .select('id, date, name, logged_sets(id, weight, reps, exercises(name))')
      .order('date', { ascending: false})
      .then(({ data }) => {
        if (data) setWorkouts(data as unknown as Workout[])
      })
  }, [])

  return (
    <AppShell>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Workouts</h1>
        {workouts.length === 0 && <p>No logged workouts. Add a workout using the sidebar.</p>}
        {workouts.map((w) => (
            <div key={w.id} style={{ border: '2px solid #333', borderRadius: '20px', marginBottom: '1rem', maxWidth: '400px' }}>
              <Link href={`/workouts/${w.id}`} style={{ display: 'block', padding: '1rem' }}>
                <p>{formatDateForDisplay(w.date)}</p>
                <h3>{w.name ?? 'Untitled'}</h3>
                {w.logged_sets.map((s) => (
                  <p key={s.id}>
                    {s.exercises?.name ?? 'Unknown exercise'} - {s.weight}lbs - {s.reps} reps
                  </p>
                ))}
              </Link>
            </div>
        ))}
      </div>
    </AppShell>
  )
}