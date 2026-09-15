'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import WorkoutCard from '@/components/WorkoutCard'
import { Workout } from '@/lib/types'

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    // Read workout data associated with user
    supabase
      .from('logged_workouts')
      .select('id, date, name, completed, logged_sets(id, weight, reps, exercises(name))')
      .order('date', { ascending: false})
      .then(({ data }) => {
        if (data) setWorkouts(data as unknown as Workout[])
      })
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Workouts</h1>
      {workouts.length === 0 && <p>No logged workouts. Add a workout using the sidebar.</p>}
      {workouts.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            isSelected={false}
            onToggleSelect={() => {return}}
            onCompleted={(id, completed) => {
              setWorkouts(
                workouts.map((w) => 
                  w.id === id ? { ...w, completed } : w
                )
              )
            }}
          />
      ))}
    </div>
  )
}