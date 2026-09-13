'use client'

import Modal from './Modal'
import { Exercise } from '@/lib/types'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

type ExerciseMenuProps = {
    isOpen: boolean
    onClose: () => void
    onCreated: (newExercise: Exercise) => void
}

export default function CreateExerciseModal({ isOpen, onClose, onCreated }: ExerciseMenuProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [error, setError] = useState('')
    const { user } = useAuth()
    
    const handleCreateExercise = async () => {
        // If user is not signed in, display error and exit
        if (!user)
        {
            setError('You must be logged in to create a workout')
            return
        }

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
        setName('')
        setDescription('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h1>Create New Exercise</h1>
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
                <button onClick={handleCreateExercise}>Create</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </Modal>
    )
}