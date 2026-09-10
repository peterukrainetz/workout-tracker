'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'

type Exercise = {
    id: number
    name: string
}

type DraftSet = {
    id: string
    exercise_id: number | null
    weight: number | null
    reps: number | null
}

export default function CreateWorkoutPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [name, setName] = useState('New Workout')
    const [notes, setNotes] = useState('')
    const [draftSets, setDraftSets] = useState<DraftSet[]>([])
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        supabase.from('exercises').select('id, name').then(({ data }) => {
            if (data) setExercises(data)
        })
    }, [])

    const handleAddRow = () => {
        const newRow: DraftSet = {
            id: crypto.randomUUID(),
            exercise_id: null,
            weight: null,
            reps: null
        }

        setDraftSets([...draftSets, newRow])
    }

    const handleSaveWorkout = async () => {
        // Store user id
        const { data: { user } } = await supabase.auth.getUser()

        // If user is not signed in, display error and exit
        if (!user)
        {
            setError('You must be logged in to create a workout')
            return
        }

        // Add new row to workout table (NOT logged_sets yet)
        const { data: workout, error: insertError } = await supabase
            .from('logged_workouts')
            .insert({ user_id: user.id, date, name, notes })
            .select('id')
            .single()

        if (insertError)
        {
            setError(insertError.message)
            return
        }

        // Map all set rows to a new variable with proper values
        const counts: Record<string, number> = {}
        const rows = draftSets.map((set) => {
            counts[set.exercise_id!] = (counts[set.exercise_id!] ?? 0) + 1

            return {
                logged_workout_id: workout.id,
                exercise_id: set.exercise_id,
                weight: set.weight,
                reps: set.reps,
                set_number: counts[set.exercise_id!],
            }
        })

        // Insert all rows into supabase
        const { error : saveError } = await supabase
            .from('logged_sets')
            .insert(rows)

        if (saveError)
        {
            setError(saveError.message)
            return
        }

        router.push('/')
    }

    return (
        <AppShell>
            <div style={{ padding: '2rem', maxWidth: '400px' }}>
                <div>
                    <input
                        type='text'
                        defaultValue='New Workout'
                        style={{ border: '2px dashed #d4d4d4', borderRadius: '8px', padding: '5px'}}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Date: </label>
                    <input type='date' value={date} onChange={(e) => setDate(e.target.value)} required style={{ colorScheme: 'light dark' }}/>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Exercise</th>
                            <th>Weight</th>
                            <th>Reps</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {draftSets.map((row) => (
                            <tr key={row.id}>
                                <td>
                                    <select
                                        value={row.exercise_id ?? ''}
                                        onChange={(e) =>
                                            setDraftSets(
                                                draftSets.map((r) => 
                                                    r.id === row.id ? { ...r, exercise_id: Number(e.target.value) } : r
                                                )
                                            )
                                        }
                                    >
                                        <option value="">Choose exercise</option>
                                        {exercises.map((ex) => (
                                            <option key={ex.id} value={ex.id}>{ex.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.weight ?? ''}
                                        onChange={(e) => 
                                            setDraftSets(
                                                draftSets.map((r) => 
                                                    r.id === row.id ? { ...r, weight: Number(e.target.value) } : r
                                                )
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.reps ?? ''}
                                        onChange={(e) => 
                                            setDraftSets(
                                                draftSets.map((r) => 
                                                    r.id === row.id ? { ...r, reps: Number(e.target.value) } : r
                                                )
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <button onClick={() => setDraftSets(draftSets.filter((r) => r.id !== row.id))}>
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={handleAddRow}>+ Add Set</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div>
                    <textarea
                        placeholder='Notes...'
                        value={notes}
                        style={{ width: '500px', border: '2px solid #d4d4d4', borderRadius: '8px', padding: '5px'}}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <div>
                    <button onClick={handleSaveWorkout}>Save Workout</button>
                </div>
            </div>
        </AppShell>
    )
}