'use client'

import { supabase } from '@/lib/supabase'
import { Workout } from '@/lib/types'
import { useState } from 'react'
import { formatDateForDisplay } from '@/lib/date'
import { useRouter } from 'next/navigation'

type WorkoutCardProps = {
    workout: Workout
    isSelected: boolean
    onToggleSelect: () => void
    onCompleted: (id: number, completed: boolean) => void
}

export default function WorkoutCard({ workout, isSelected, onToggleSelect, onCompleted }: WorkoutCardProps) {
    const [error, setError] = useState('')
    const router = useRouter()
    
    const handleMarkCompleted = async () => {
        const { data: updatedWorkout, error: completeError } = await supabase
            .from('logged_workouts')
            .update({ completed: !workout.completed })
            .eq('id', workout.id)
            .select()
            .single()

        if (completeError)
        {
            setError(completeError.message)
            return
        } 

        onCompleted(updatedWorkout.id, updatedWorkout.completed)
    }

    return (
        <div className='transition-transform duration-300 ease-in-out hover:scale-105' style={{
            border: '2px solid',
            borderRadius: '20px',
            borderColor: workout.completed ? 'rgb(0, 102, 36)' : '#333',
            backgroundColor: workout.completed ? 'rgb(0, 138, 92)' : undefined,
            marginBottom: '1rem',
            maxWidth: '400px',
        }}>
            <div onClick={() => {
                router.push(`/workouts/${workout.id}`)
            }}
            style={{
                display: 'block',
                padding: '1rem',
                cursor: 'pointer'
            }}>
                <div style={{
                display: 'flex'
                }}>
                    <button onClick={(e) => {
                        e.stopPropagation()
                        onToggleSelect()
                    }} 
                    style={{
                        alignSelf: 'flex-start',
                        paddingRight: '1rem',
                        cursor: 'pointer'
                    }}>
                        O
                    </button>

                    <div style={{ flex: '1' }}>
                        <p>{formatDateForDisplay(workout.date)}</p>
                        <h3>{workout.name ?? 'Untitled Workout'}</h3>
                        {workout.logged_sets.map((s) => (
                            <p key={s.id}>
                            {s.exercises?.name ?? 'Unknown exercise'} - {s.weight}lbs - {s.reps} reps
                            </p>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {workout.completed && <p style={{
                            alignSelf: 'flex-end',
                            color: '#145200'
                        }}>
                            (Completed)
                        </p>}

                        <button onClick={(e) => {
                            e.stopPropagation()
                            handleMarkCompleted()
                        }}
                        style={{ alignSelf: 'flex-end', marginTop: 'auto', cursor: 'pointer' }}
                        >
                            {workout.completed ? 'Mark Incomplete' : 'Complete'}
                        </button>

                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </div>
                </div>  
            </div>
        </div>
    )
}