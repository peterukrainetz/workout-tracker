'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams, notFound } from 'next/navigation'
import { toLocalDateString } from '@/lib/date'
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

export default function EditWorkoutPage() {
    const [date, setDate] = useState(toLocalDateString(new Date()))
    const [name, setName] = useState('New Workout')
    const [notes, setNotes] = useState('')
    const [draftSets, setDraftSets] = useState<DraftSet[]>([])
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [error, setError] = useState('')
    const [notFoundState, setNotFoundState] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { id } = useParams()

    // Load exercise list
    useEffect(() => {
        supabase.from('exercises').select('id, name').then(({ data }) => {
            if (data) setExercises(data)
        })
    }, [])

    // Load workout info on the form
    useEffect(() => {
        supabase
            .from('logged_workouts')
            .select('id, date, name, notes, logged_sets(id, exercise_id, weight, reps)')
            .eq('id', id)
            .single()
            .then(({ data, error}) => {
                if (error) {
                    setNotFoundState(true)
                    setIsLoading(false)
                    return
                }

                setDate(new Date(data?.date ?? Date.now()).toISOString().split('T')[0])
                setName(data?.name ?? 'Untitled Workout')
                setNotes(data?.notes ?? '')
                const mapped = data?.logged_sets.map((s) => ({
                    id: crypto.randomUUID(),
                    exercise_id: s.exercise_id,
                    weight: s.weight,
                    reps: s.reps,
                }))

                setDraftSets(mapped ?? [])
                setIsLoading(false)
            })
    },[id])

    if (notFoundState) {
        notFound()
    }

    const handleAddRow = () => {
        const newRow: DraftSet = {
            id: crypto.randomUUID(),
            exercise_id: null,
            weight: null,
            reps: null
        }

        setDraftSets([...draftSets, newRow])
    }

    const handleUpdateWorkout = async () => {
        // Store user id
        const { data: { user } } = await supabase.auth.getUser()

        // If user is not signed in, display error and exit
        if (!user)
        {
            setError('You must be logged in to update a workout')
            return
        }

        // Update workout name and date independently from rows
        const { error: updateError } = await supabase
            .from('logged_workouts')
            .update({ date, name, notes })
            .eq('id', id)

        if (updateError)
        {
            setError(updateError.message)
            return
        }

        // Delete all logged sets in workout
        const { error: deleteError } = await supabase
            .from('logged_sets')
            .delete()
            .eq('logged_workout_id', id)

        if (deleteError)
        {
            setError(deleteError.message)
            return
        }

        // Map all set rows to a new variable with proper values
        const counts: Record<string, number> = {}
        const rows = draftSets.map((set) => {
            counts[set.exercise_id!] = (counts[set.exercise_id!] ?? 0) + 1

            return {
                logged_workout_id: id,
                exercise_id: set.exercise_id,
                weight: set.weight,
                reps: set.reps,
                set_number: counts[set.exercise_id!],
            }
        })

        // Insert all rows into supabase
        const { error : saveError } = await supabase.from('logged_sets').insert(rows)

        if (saveError)
        {
            setError(saveError.message)
            return
        }

        router.push('/')
    }

    const handleDeleteWorkout = async () => {
        const { error: deleteError } = await supabase
            .from('logged_workouts')
            .delete()
            .eq('id', id)

        if (deleteError)
        {
            setError(deleteError.message)
            return
        }

        router.push('/')
    }

    return (
        <AppShell>
            {isLoading ? <h1 style={{ padding: '2rem' }}>Loading...</h1> : (
                <div style={{ padding: '2rem', maxWidth: '400px' }}>
                    <h1>Edit Workout</h1>
                    <div>
                        <label>Name: </label>
                        <input type='text' value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Date: </label>
                        <input type='date' value={date} onChange={(e) => setDate(e.target.value)} required style={{ colorScheme: 'light dark' }}/>
                    </div>
                    <p>{draftSets.length} sets added</p>
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
                                            <option value=''>Exercise</option>
                                            {exercises.map((ex) => (
                                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type='number'
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
                                            type='number'
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
                    <div>
                        <textarea
                            placeholder='Notes...'
                            value={notes}
                            style={{ width: '500px', border: '2px solid #d4d4d4', borderRadius: '8px', padding: '5px'}}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div style={{ display: 'flex' }}>
                        <button onClick={handleUpdateWorkout}>Save</button>
                        <button 
                            style={{ color: 'red', flex: '1' }}
                            onClick={() => {
                                if (confirm('Delete this workout? This cannot be undone.')) {
                                    handleDeleteWorkout()
                            }}}
                            >
                            Delete Workout
                        </button>
                    </div>
                </div>
            )}
        </AppShell>
    )
}