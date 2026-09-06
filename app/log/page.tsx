'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { React } from 'next/dist/server/route-modules/app-page/vendored/rsc/entrypoints'

type Exercise = {
    id: number
    name: string
}

export default function LogPage() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [exerciseId, setExerciseId] = useState('')
    const [weight, setWeight] = useState('')
    const [reps, setReps] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        supabase.from('exercises').select('id, name').then(({ data }) => {
            if (data) setExercises(data)
        })
    }, [])

    const handleLogSet = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setMessage('You must be logged in to create a workout')
            return
        }

        const today = new Date().toISOString().split('T')[0]

        let { data: workout } = await supabase
            .from('logged_workouts')
            .select('id')
            .eq('user_id', user.id)
            .gte('date', `${today}T00:00:00`)
            .lte('date', `${today}T23:59:59`)
            .maybeSingle()

        if (!workout) {
            const { data: newWorkout, error: workoutError } = await supabase
                .from('logged_workouts')
                .insert({ user_id: user.id })
                .select('id')
                .single()

            if (workoutError) {
                setMessage(workoutError.message)
                return
            }
            workout = newWorkout
        }

        const { error: setError } = await supabase.from('logged_sets').insert({
            logged_workout_id: workout.id,
            exercise_id: Number(exerciseId),
            weight: Number(weight),
            reps: Number(reps),
            set_number: 1,
        })

        if (setError) {
            setMessage(setError.message)
        } else {
            setMessage('Set logged successfully')
            setWeight('')
            setReps('')
        }
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '400px' }}>
            <h1>Log a Set</h1>
            <form onSubmit={handleLogSet}>
                <div>
                    <label>Exercise</label>
                    <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} required>
                        <option value="">Select an exercise</option>
                        {exercises.map((ex) => (
                            <option key={ex.id} value={ex.id}>{ex.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Weight</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                </div>
                <div>
                    <label>Reps</label>
                    <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} required />
                </div>
                {message && <p>{message}</p>}
                <button type="submit">Log Set</button>
            </form>
        </div>
    )
}