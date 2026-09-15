'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toLocalDateString } from '@/lib/date'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Workout } from '@/lib/types'
import WorkoutCard from '@/components/WorkoutCard'

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<Workout[]>([])
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<number>>(new Set())
  const { user } = useAuth()

  useEffect(() => {
    supabase
      .from('logged_workouts')
      .select('id, date, name, completed, logged_sets(id, weight, reps, exercises(name))')
      .or(`date.lt.${toLocalDateString(new Date())},completed.eq.true`)
      .order('date', { ascending: false})
      .limit(3)
      .then(({ data }) => {
        if (data) setWorkouts(data as unknown as Workout[])
      })

    supabase
      .from('logged_workouts')
      .select('id, date, name, completed, logged_sets(id, weight, reps, exercises(name))')
      .gte('date', toLocalDateString(new Date()))
      .eq('completed', false)
      .order('date', { ascending: true})
      .limit(3)
      .then(({ data }) => {
        if (data) setUpcomingWorkouts(data as unknown as Workout[])
      })
  }, [])

  function handleWorkoutCompletionChange(id: number, completed: boolean) {
    const foundInRecent = workouts.find((w) => w.id === id)
    const foundInUpcoming = upcomingWorkouts.find((w) => w.id === id)

    const updatedWorkout = { ...(foundInRecent ?? foundInUpcoming)!, completed }

    const belongsInRecent = updatedWorkout.date < toLocalDateString(new Date()) || completed === true

    let newRecent: Workout[]
    let newUpcoming: Workout[]

    if (belongsInRecent) {
      newRecent = [...workouts.filter((w) => w.id !== id), updatedWorkout]
      newUpcoming = upcomingWorkouts.filter((w) => w.id !== id)
    } else {
      newUpcoming = [...upcomingWorkouts.filter((w) => w.id !== id), updatedWorkout]
      newRecent = workouts.filter((w) => w.id !== id)
    }

    const sortedRecent = [...newRecent].sort((a, b) => b.date.localeCompare(a.date))
    const sortedUpcoming = [...newUpcoming].sort((a, b) => a.date.localeCompare(b.date))

    setWorkouts(sortedRecent)
    setUpcomingWorkouts(sortedUpcoming)

      
  }

  return (
    <div style={{ padding: '2rem' }}>
      {user ? <h1>Hello, {user.email}!</h1> : <h1>You are not signed in.</h1>}

      <h2 style={{ paddingLeft: '2rem' }}>Recent Workouts</h2>
        <div style={{ padding: '1rem',
          border: '2px solid #ffffff',
          borderRadius: '20px',
          marginBottom: '1rem',
          width: 'fit-content'
        }}>
          {workouts.length === 0 && <p>No recent workouts. Add a workout using the sidebar.</p>}
          {workouts.map((w) => (
              <WorkoutCard
                key={w.id}
                workout={w}
                isSelected={false}
                onToggleSelect={() => {return}}
                onCompleted={(id, completed) => handleWorkoutCompletionChange(id, completed)}
              />
          ))}
          {workouts.length !== 0 && <p><Link href="/workouts">See all</Link></p>}
        </div>

      <h2 style={{ paddingLeft: '2rem' }}>Upcoming Workouts</h2>
        <div style={{ padding: '1rem',
          border: '2px solid #ffffff',
          borderRadius: '20px',
          marginBottom: '1rem',
          width: 'fit-content'
        }}>
          {upcomingWorkouts.length === 0 && <p>No upcoming workouts. Add a workout using the sidebar.</p>}
            {upcomingWorkouts.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              isSelected={false}
              onToggleSelect={() => {return}}
              onCompleted={(id, completed) => handleWorkoutCompletionChange(id, completed)}
            />
          ))}
          {upcomingWorkouts.length !== 0 && <p><Link href="/workouts">See all</Link></p>}
        </div>
    </div>
  )
}