'use client'

import Modal from './Modal'
import { Exercise } from '@/lib/types'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

type CreateExerciseProps = {
    isOpen: boolean
    existingExercise: Exercise | null
    onClose: () => void
    onCreated: (newExercise: Exercise) => void
}

export default function ExerciseHandlerModal({ isOpen, existingExercise, onClose, onCreated }: CreateExerciseProps) {
    const [name, setName] = useState(existingExercise?.name ?? '')
    const [description, setDescription] = useState(existingExercise?.description ?? '')
    const [error, setError] = useState('')
    const { user } = useAuth()
    
    useEffect(() => {
        setName(existingExercise?.name ?? '')
        setDescription(existingExercise?.description ?? '')
    }, [existingExercise])

    const handleUpdateOrCreateExercise = async () => {
        // If user is not signed in, display error and exit
        if (!user)
        {
            setError('You must be logged in to create or edit an exercise')
            return
        }

        if (existingExercise) {
            const { data: updatedExercise, error: insertError } = await supabase
                .from('exercises')
                .update({ name, description })
                .eq('id', existingExercise.id)
                .select()
                .single()

            if (insertError)
            {
                setError(insertError.message)
                return
            }

            onCreated(updatedExercise)

        } else {
            const { data: newExercise, error: insertError } = await supabase
                .from('exercises')
                .insert({ user_id: user.id, description, name })
                .select()
                .single()

            if (insertError)
            {
                setError(insertError.message)
                return
            }

            onCreated(newExercise)
        }

        setName('')
        setDescription('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h1>{existingExercise ? 'Edit Exercise' : 'Create New Exercise'}</h1>
            <div>
                <label>Name: </label>
                <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <textarea
                    placeholder='Description...'
                    value={description}
                    style={{ width: '500px', border: '2px solid #d4d4d4', borderRadius: '8px', padding: '5px'}}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'space-evenly'}}>
                <button onClick={handleUpdateOrCreateExercise}>
                    {existingExercise ? 'Save' : 'Create'}
                </button>

                <button onClick={onClose}>Cancel</button>
            </div>
        </Modal>
    )
}