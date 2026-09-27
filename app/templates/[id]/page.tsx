'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams, notFound } from 'next/navigation'
import Modal from '@/components/Modal'
import ExerciseMenu from '@/components/ExerciseMenu'
import { Exercise } from '@/lib/types'
import ExerciseHandler from '@/components/ExerciseHandler'
import { Trash, Copy } from 'lucide-react'

type DraftSet = {
    id: string
    exercise_id: number | null
    weight: number | null
    reps: number | null
}

export default function EditTemplatePage() {
    const [name, setName] = useState('New Template')
    const [description, setDescription] = useState('')
    const [draftSets, setDraftSets] = useState<DraftSet[]>([])
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [error, setError] = useState('')
    const [showExerciseMenu, setShowExerciseMenu] = useState(false)
    const [showCreateExercise, setShowCreateExercise] = useState(false)
    const [activeRowId, setActiveRowId] = useState<string | null>(null)
    const [notFoundState, setNotFoundState] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const router = useRouter()
    const { id } = useParams()
    const [originalData, setOriginalData] = useState<{
            name: string
            description: string
            draftSets: DraftSet[]
        } | null>(null)
    
    // Tracks whether changes have been made
    const isDirty =
        originalData !== null
        && JSON.stringify({ name, description, draftSets }) !== JSON.stringify(originalData)
    const [showLeaveWarning, setShowLeaveWarning] = useState(false)
    const [pendingHref, setPendingHref] = useState<string | null>(null)

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

    // Load template info on the form
    useEffect(() => {
        supabase
            .from('workout_templates')
            .select('id, name, description, template_sets(id, exercise_id, weight, reps)')
            .eq('id', id)
            .single()
            .then(({ data, error}) => {
                if (error) {
                    setNotFoundState(true)
                    setIsLoading(false)
                    return
                }

                setName(data?.name ?? 'Untitled Template')
                setDescription(data?.description ?? '')
                const mapped = data?.template_sets.map((s) => ({
                    id: crypto.randomUUID(),
                    exercise_id: s.exercise_id,
                    weight: s.weight,
                    reps: s.reps,
                }))

                setDraftSets(mapped ?? [])
                
                setOriginalData({
                    name: data?.name ?? 'Untitled Workout',
                    description: data?.description ?? '',
                    draftSets: mapped ?? []
                })

                setIsLoading(false)
            })
    },[id])

    if (notFoundState) {
        notFound()
    }

    // Warn user before leaving the page
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)

    }, [isDirty])

    // Warn user before leaving the page after clicking a link
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!isDirty) return

            const target = e.target as HTMLElement
            const anchor = target.closest('a')

            if (!anchor) return

            const href = anchor.getAttribute('href')
            if (!href) return

            e.preventDefault()
            setPendingHref(href)
            setShowLeaveWarning(true)
        }

        document.addEventListener('click', handleClick, true)
        return () => document.removeEventListener('click', handleClick, true)
    }, [isDirty])

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

    const handleUpdateTemplate = async () => {
        // Store user id
        const { data: { user } } = await supabase.auth.getUser()

        // If user is not signed in, display error and exit
        if (!user)
        {
            setError('You must be logged in to update a workout')
            return
        }

        // Update workout name and description independently from rows
        const { error: updateError } = await supabase
            .from('workout_templates')
            .update({ name, description })
            .eq('id', id)

        if (updateError) {
            setError(updateError.message)
            return
        }

        // Delete all sets in template
        const { error: deleteError } = await supabase
            .from('template_sets')
            .delete()
            .eq('workout_template_id', id)

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
                workout_template_id: id,
                exercise_id: set.exercise_id,
                weight: set.weight,
                reps: set.reps,
                set_number: counts[set.exercise_id!]
            }
        })

        // Insert all rows into supabase
        const { error : saveError } = await supabase.from('template_sets').insert(rows)

        if (saveError)
        {
            setError(saveError.message)
            return
        }

        router.push('/workouts')
    }

    const handleDeleteTemplate = async () => {
        const { error: deleteError } = await supabase
            .from('workout_templates')
            .delete()
            .eq('id', id)

        if (deleteError)
        {
            setError(deleteError.message)
            return
        }

        router.push('/workouts')
    }

    return (
        <>
            {isLoading ? <h1 style={{ padding: '2rem' }}>Loading...</h1> : (
                <div style={{ padding: '2rem', maxWidth: '400px' }}>
                    <h1>Edit Template</h1>
                    <div>
                        <label>Name: </label>
                        <input
                            type='text'
                            value={name}
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
                    <div>
                        <textarea
                            placeholder='Description'
                            value={description}
                            style={{ width: '500px', border: '2px solid #d4d4d4', borderRadius: '8px', padding: '5px'}}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <div style={{ display: 'flex' }}>
                        <button onClick={handleUpdateTemplate}>Save</button>
                        <button 
                            style={{ color: 'red', flex: '1' }}
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            Delete Template
                        </button>
                    </div>
                    
                </div>
            )}

            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                <h1>Confirm Delete</h1>
                <p>Are you sure you want to delete this template? This cannot be undone.</p>
                <div style={{ display: 'flex', justifyContent: 'space-evenly'}}>
                    <button onClick={handleDeleteTemplate}>Delete</button>
                    <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                </div>
            </Modal>

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

            <Modal isOpen={showLeaveWarning} onClose={() => setShowLeaveWarning(false)}>
                <h1>Unsaved Changes</h1>
                <p>Your changes will be discarded. Are you sure you want to leave?</p>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <button
                        style={{ color: 'red' }}
                        onClick={() => {
                            if (pendingHref) {
                                router.push(pendingHref)
                            }
                            setShowLeaveWarning(false)
                        }}
                    >
                        Don't save
                    </button>
                    <button onClick={() => setShowLeaveWarning(false)}>Cancel</button>
                </div>
            </Modal>
        </>
    )
}