'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Exercise } from '@/lib/types'
import Modal from '@/components/Modal'
import ExerciseHandler from '@/components/ExerciseHandler'
import { useAuth } from '@/context/AuthContext'
import { existsSync } from 'fs'

export default function Exercises() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null)
    const [showExerciseHandler, setShowExerciseHandler] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [error, setError] = useState('')
    const { user } = useAuth();
    const selectedExercise = exercises.find((item) => item.id === selectedExerciseId)
    const isOwner = selectedExercise?.user_id === user?.id

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

    const handleDeleteExercise = async () => {
        const { error: deleteError } = await supabase
            .from('exercises')
            .delete()
            .eq('id', selectedExerciseId)

        if (deleteError)
        {
            setError(deleteError.message)
            return
        }

        setSelectedExerciseId(null)
        setShowDeleteConfirm(false)
        setExercises(exercises.filter((e) => e.id !== selectedExerciseId))
    }

    return (
        <>
            <div style={{ padding: '2rem' }}
                onClick={() => {
                    setError('')
                    setSelectedExerciseId(null)
                }}
            >
                <div style={{
                        display: 'flex',
                        width: '20vw',
                        padding: '0.5rem',
                        justifyContent: 'space-evenly'
                }}>
                    <h1>Exercises</h1>
                    <button onClick={(e) => {
                        e.stopPropagation()
                        setSelectedExerciseId(null)
                        setShowExerciseHandler(true)
                    }}>
                        + Add New
                    </button>
                </div>
                    <div style={{
                        display: 'flex'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '80vh',
                            overflowY: 'auto',
                            width: '20vw',
                            alignItems: 'center',
                            borderRight: '1px solid #333'
                        }}>
                            {exercises.map((ex) => (
                                <button
                                    style={{
                                        paddingBottom: '1rem',
                                        fontWeight: selectedExerciseId === ex.id ? 'bolder' : undefined,
                                        fontSize: selectedExerciseId === ex.id ? '1.1rem' : undefined,
                                        width: '12vw'
                                    }}
                                    key={ex.id}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setError('')
                                        setSelectedExerciseId(ex.id)
                                    }}
                                >
                                    {ex.name}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: '1' }}>
                            {selectedExerciseId ? (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        height: '80vh'
                                    }}>
                                        <h1 style={{ paddingBottom: '2rem' }}>{exercises.find((item) => item.id === selectedExerciseId)?.name}</h1>
                                        <p>Description:</p>
                                        <p>{exercises.find((item) => item.id === selectedExerciseId)?.description}</p>
                                    </div>

                                    <p style={{
                                        justifySelf: 'center',
                                        color: 'red'
                                    }}>
                                        {error}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-evenly',
                                    }}>
                                        {isOwner &&
                                            <>
                                                <button onClick={(e) => {
                                                    e.stopPropagation()
                                                    setShowExerciseHandler(true)
                                                }}>
                                                    Edit
                                                </button>
                                            
                                                <button 
                                                    style={{ color: 'red' }}
                                                    onClick={async (e) => {
                                                        e.stopPropagation()

                                                        const { count } = await supabase
                                                            .from('logged_sets')
                                                            .select('*', { count: 'exact', head: true })
                                                            .eq('exercise_id', selectedExerciseId)

                                                        if (count && count > 0)
                                                        {
                                                            setError('Cannot delete exercise because it exists in a saved workout.')
                                                            return
                                                        }

                                                        setShowDeleteConfirm(true)
                                                    }}
                                                >
                                                    Delete Exercise
                                                </button>
                                            </>
                                        }
                                    </div>
                                </>
                            ) : (
                                <h1 style={{ justifySelf: 'center' }}>
                                    Select an exercise to view
                                </h1>
                            )}
                        </div>
                    </div>
            </div>

            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                <h1>Confirm Delete</h1>
                <p>Are you sure you want to delete this exercise? This cannot be undone.</p>
                <div style={{ display: 'flex', justifyContent: 'space-evenly'}}>
                    <button onClick={() => handleDeleteExercise()}>Delete</button>
                    <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                </div>
            </Modal>

            <ExerciseHandler
                isOpen={showExerciseHandler}
                existingExercise={selectedExercise ?? null}
                onClose={() => {
                    setShowExerciseHandler(false)
                }}
                onCreated={(newExercise) => {
                    if (selectedExercise) {
                        setExercises(
                            exercises.map((ex) => 
                                ex.id === newExercise.id ? newExercise : ex
                            )
                        )
                    }
                    else {
                        setExercises([...exercises, newExercise])
                    }
                        
                }}
            />
        </>
    )
}