'use client'

import { use, useState } from 'react'
import { Template } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Circle, CalendarPlus } from 'lucide-react'
import { toLocalDateString } from '@/lib/date'
import Modal from './Modal'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

type TemplateCardProps = {
    template: Template
    isSelected: boolean
    onToggleSelect: () => void
    onInstantiate: () => void
}

export default function WorkoutCard({ template, isSelected, onToggleSelect, onInstantiate }: TemplateCardProps) {
    const [showInstantiateModal, setShowInstantiateModal] = useState(false)
    const [instantiateDate, setInstantiateDate] = useState(toLocalDateString(new Date()))
    const [error, setError] = useState('')
    const router = useRouter()
    const { user } = useAuth()

    const handleInstantiate = async () => {
        if (!user) {
            setError('You must be logged in to instantiate a template')
            return
        }

        const { data: workout, error: insertError } = await supabase
            .from('logged_workouts')
            .insert({
                user_id: user.id,
                date: instantiateDate,
                name: template.name,
                notes: template.description
            })
            .select('id')
            .single()

        if (insertError)
        {
            setError(insertError.message)
            return
        }

        const counts: Record<string, number> = {}
        const rows = template.template_sets.map((set) => {
            counts[set.exercise_id!] = (counts[set.exercise_id!] ?? 0) + 1

            return {
                logged_workout_id: workout.id,
                exercise_id: set.exercise_id,
                weight: set.weight,
                reps: set.reps,
                set_number: counts[set.exercise_id!],
            }
        })

        const { error: saveError } = await supabase.from('logged_sets').insert(rows)

        if (saveError) {
            setError(saveError.message)
            return
        }

        router.push(`/workouts/${workout.id}`)
    }

    return (
        <>
            <div className='transition-transform duration-300 ease-in-out hover:scale-105' style={{
                border: '2px solid',
                borderRadius: '20px',
                borderColor: '#333',
                marginBottom: '1rem',
                maxWidth: '400px',
            }}>
                <div onClick={() => {
                    router.push(`/templates/${template.id}`)
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
                            <Circle size={'1rem'}/>
                        </button>

                        <div style={{ flex: '1' }}>
                            <h3>{template.name ?? 'Untitled Template'}</h3>
                            {template.template_sets.map((s) => (
                                <p key={s.id}>
                                {s.exercises?.name ?? 'Unknown exercise'} - {s.weight}lbs - {s.reps} reps
                                </p>
                            ))}
                        </div>

                        <button onClick={(e) => {
                            e.stopPropagation()
                            setShowInstantiateModal(true)
                        }}
                        style={{
                            alignSelf: 'flex-start',
                            paddingLeft: '1rem',
                            cursor: 'pointer',
                            marginLeft: 'auto'
                        }}
                        title='Plan workout with template'
                        >
                            <CalendarPlus size={'1rem'} />
                        </button>
                    </div>  
                </div>
            </div>

            <Modal
                isOpen={showInstantiateModal}
                onClose={() => setShowInstantiateModal(false)}
            >
                <h1>Choose a date</h1>
                <input 
                    type='date'
                    value={instantiateDate}
                    onChange={(e) => setInstantiateDate(e.target.value)}
                />
                <button onClick={handleInstantiate}>Create Workout</button>
                <p color='red'>{error}</p>
            </Modal>
        </>
    )
}