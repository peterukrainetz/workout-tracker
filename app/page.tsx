'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toLocalDateString } from '@/lib/date'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Workout } from '@/lib/types'
import WorkoutCard from '@/components/WorkoutCard'
import ActionBar from '@/components/ActionBar'

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<Workout[]>([])
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')
  const { user, username } = useAuth()

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

  const handleBulkComplete = async () => {
      const { error: updateError } = await supabase
        .from('logged_workouts')
        .update({ completed: true })
        .in('id', [...selectedWorkouts])

      if (updateError)
      {
        setError(updateError.message)
        return
      }

      const allWorkouts = [...workouts, ...upcomingWorkouts]

      const updatedSelected = allWorkouts
        .filter((w) => selectedWorkouts.has(w.id))
        .map((w) => ({ ...w, completed: true }))

      const untouched = allWorkouts.filter((w) => !selectedWorkouts.has(w.id))

      const today = toLocalDateString(new Date())
      const newRecent = [...untouched.filter((w) => w.date < today || w.completed), ...updatedSelected]
      const newUpcoming = [...untouched.filter((w) => w.date >= today && !w.completed)]

      setWorkouts([...newRecent].sort((a, b) => b.date.localeCompare(a.date)))
      setUpcomingWorkouts([...newUpcoming].sort((a, b) => a.date.localeCompare(b.date)))

      setSelectedWorkouts(new Set())
    }

  const handleBulkDelete = async () => {
      const { error: deleteError } = await supabase
        .from('logged_workouts')
        .delete()
        .in('id', [...selectedWorkouts])

      if (deleteError)
      {
        setError(deleteError.message)
        return
      }

      setWorkouts(workouts.filter((w) => !selectedWorkouts.has(w.id)))
      setUpcomingWorkouts(upcomingWorkouts.filter((w) => !selectedWorkouts.has(w.id)))
      setSelectedWorkouts(new Set())
    }

  return (
    <>
      <div style={{ padding: '2rem' }}>
        {user ? <h1>Hello, {username}!</h1> : <h1>You are not signed in.</h1>}

        <p>{error}</p>

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
                  isSelected={selectedWorkouts.has(w.id)}
                  onToggleSelect={() => {
                    setSelectedWorkouts((prev) => {
                      const next = new Set(prev)
                      if (next.has(w.id)) next.delete(w.id)
                      else next.add(w.id)
                      return next
                    })
                  }}
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
                isSelected={selectedWorkouts.has(w.id)}
                onToggleSelect={() => {
                  setSelectedWorkouts((prev) => {
                    const next = new Set(prev)
                    if (next.has(w.id)) next.delete(w.id)
                    else next.add(w.id)
                    return next
                  })
                }}
                onCompleted={(id, completed) => handleWorkoutCompletionChange(id, completed)}
              />
            ))}
            {upcomingWorkouts.length !== 0 && <p><Link href="/workouts">See all</Link></p>}
          </div>
      </div>

      <ActionBar
        count={selectedWorkouts.size}
        onMarkComplete={() => handleBulkComplete()}
        onDuplicate={() => {return}}
        onDelete={() => handleBulkDelete()}
        onDeselect={() => setSelectedWorkouts(new Set())}
      />
    </>
  )
}