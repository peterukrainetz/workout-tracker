'use client'

import { supabase } from '@/lib/supabase'
import { Template } from '@/lib/types'
import { useState } from 'react'
import { formatDateForDisplay } from '@/lib/date'
import { useRouter } from 'next/navigation'

type TemplateCardProps = {
    template: Template
    isSelected: boolean
    onToggleSelect: () => void
    onInstantiate: () => void
}

export default function WorkoutCard({ template, isSelected, onToggleSelect, onInstantiate }: TemplateCardProps) {
    const router = useRouter()

    return (
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
                        O
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
                        onInstantiate()
                    }} 
                    style={{
                        alignSelf: 'flex-start',
                        paddingRight: '1rem',
                        cursor: 'pointer'
                    }}>
                        Use Template
                    </button>
                </div>  
            </div>
        </div>
    )
}