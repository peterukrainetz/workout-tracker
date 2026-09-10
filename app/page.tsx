'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toLocalDateString } from '@/lib/date'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
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

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<Workout[]>([])
  const { user } = useAuth()

  useEffect(() => {
    supabase
      .from('logged_workouts')
      .select('id, date, name, logged_sets(id, weight, reps, exercises(name))')
      .lt('date', toLocalDateString(new Date()))
      .order('date', { ascending: false})
      .limit(3)
      .then(({ data }) => {
        if (data) setWorkouts(data as unknown as Workout[])
      })

    supabase
      .from('logged_workouts')
      .select('id, date, name, logged_sets(id, weight, reps, exercises(name))')
      .gte('date', toLocalDateString(new Date()))
      .order('date', { ascending: true})
      .limit(3)
      .then(({ data }) => {
        if (data) setUpcomingWorkouts(data as unknown as Workout[])
      })
  }, [])

  return (
    <AppShell>
      <div style={{ padding: '2rem' }}>
        {user ? <h1>Hello, {user.email}!</h1> : <h1>You are not signed in.</h1>}

        <h2>Recent Workouts</h2>
        {workouts.length === 0 && <p>No recent workouts. Add a workout using the sidebar.</p>}
        {workouts.map((w) => (
            <div key={w.id} style={{ border: '2px solid #333', borderRadius: '20px', marginBottom: '1rem', maxWidth: '400px' }}>
              <Link href={`/workouts/${w.id}`} style={{ display: 'block', padding: '1rem' }}>
                <p>{w.date.split('T')[0]}</p>
                <h3>{w.name ?? 'Untitled Workout'}</h3>
                {w.logged_sets.map((s) => (
                  <p key={s.id}>
                    {s.exercises?.name ?? 'Unknown exercise'} - {s.weight}lbs - {s.reps} reps
                  </p>
                ))}
              </Link>
            </div>
        ))}
        <p><Link href="/workouts">See all</Link></p>

        <h2>Upcoming Workouts</h2>
        {upcomingWorkouts.length === 0 && <p>No upcoming workouts. Add a workout using the sidebar.</p>}
        {upcomingWorkouts.map((w) => (
            <div key={w.id} style={{ border: '2px solid #333', borderRadius: '20px', marginBottom: '1rem', maxWidth: '400px' }}>
              <Link href={`/workouts/${w.id}`} style={{ display: 'block', padding: '1rem' }}>
                <p>{w.date.split('T')[0]}</p>
                <h3>{w.name ?? 'Untitled Workout'}</h3>
                {w.logged_sets.map((s) => (
                  <p key={s.id}>
                    {s.exercises?.name ?? 'Unknown exercise'} - {s.weight}lbs - {s.reps} reps
                  </p>
                ))}
              </Link>
            </div>
        ))}
        <p><Link href="/workouts">See all</Link></p>
        
      </div>
    </AppShell>
  )
}