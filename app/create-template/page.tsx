'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ExerciseMenu from '@/components/ExerciseMenu'
import { Exercise } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import ExerciseHandler from '@/components/ExerciseHandler'
import { Trash, Copy } from 'lucide-react'

type DraftSet = {
    id: string
    exercise_id: number | null
    weight: number | null
    reps: number | null
}

export default function CreateTemplatePage() {
    const [name, setName] = useState('New Workout')
    const [description, setDescription] = useState('')
    const [draftSets, setDraftSets] = useState<DraftSet[]>([])
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [error, setError] = useState('')
    const [showExerciseMenu, setShowExerciseMenu] = useState(false)
    const [showCreateExercise, setShowCreateExercise] = useState(false)
    const [activeRowId, setActiveRowId] = useState<string | null>(null)
    const { user } = useAuth()
    const router = useRouter()

    // Load exercise list
    useEffect(() => {
        supabase
            .from('exercises')
            .select('*')
            .order('name', {ascending: true})
            .then(({ data }) => {
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

    const handleDuplicateRow = () => {
        const foundRow = draftSets.find((item) => activeRowId === item.id)

        const duplicateRow: DraftSet = foundRow
            ? { ...foundRow, id: crypto.randomUUID() }
            : { id: crypto.randomUUID(), exercise_id: null, weight: null, reps: null }

        setDraftSets([...draftSets, duplicateRow])
    }

    const handleSaveTemplate = async () => {
        // If user is not signed in, display error and exit
        if (!user)
        {
            setError('You must be logged in to create a template')
            return
        }

        // Add new row to workout table (NOT logged_sets yet)
        const { data: workout, error: insertError } = await supabase
            .from('workout_templates')
            .insert({ user_id: user.id, name, description })
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
                workout_template_id: workout.id,
                exercise_id: set.exercise_id,
                weight: set.weight,
                reps: set.reps,
                set_number: counts[set.exercise_id!],
            }
        })

        // Insert all rows into supabase
        const { error : saveError } = await supabase
            .from('template_sets')
            .insert(rows)

        if (saveError)
        {
            setError(saveError.message)
            return
        }

        router.push('/')
    }

    return (
        <>
            <div style={{ padding: '2rem', maxWidth: '400px' }}>
                <div>
                    <input
                        type='text'
                        defaultValue='New Template'
                        style={{ border: '2px dashed #d4d4d4', borderRadius: '8px', padding: '5px'}}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                                    <button onClick={() => {
                                        setShowExerciseMenu(true)
                                        setActiveRowId(row.id)
                                    }}>
                                        {row.exercise_id ? exercises.find((item) => item.id === row.exercise_id)?.name
                                                            : 'Choose Exercise'}
                                    </button>
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
                                <td style={{ display: 'flex' }}>
                                    <button
                                        style={{ paddingRight: '0.5rem' }}
                                        onClick={() => {
                                                setActiveRowId(row.id)
                                                handleDuplicateRow()
                                            }
                                        }
                                    >
                                        <Copy size={'1rem'} />
                                    </button>

                                    <button onClick={() => setDraftSets(draftSets.filter((r) => r.id !== row.id))}>
                                        <Trash size={'1rem'} />
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
                        placeholder='Description'
                        value={description}
                        style={{ width: '500px', border: '2px solid #d4d4d4', borderRadius: '8px', padding: '5px'}}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <button onClick={handleSaveTemplate}>Save Template</button>
                </div>
            </div>

            <ExerciseMenu
                isOpen={showExerciseMenu}
                onClose={() => setShowExerciseMenu(false)}
                exercises={exercises}
                onSelect={(exerciseId) => {
                    setDraftSets(
                        draftSets.map((r) =>
                            r.id === activeRowId ? {...r, exercise_id: exerciseId} : r
                        )
                    )

                    setShowExerciseMenu(false)
                }}
                onAddNew={() => {
                    setShowExerciseMenu(false)
                    setShowCreateExercise(true)
                }}
            />
            
            <ExerciseHandler
                isOpen={showCreateExercise}
                existingExercise={null}
                onClose={() => {
                    setShowCreateExercise(false)
                }}
                onCreated={(newExercise) => {
                    setDraftSets(
                        draftSets.map((r) =>
                            r.id === activeRowId ? {...r, exercise_id: newExercise.id} : r
                        )
                    )

                    setExercises([...exercises, newExercise])
                }}
            />
        </>
        
    )
}