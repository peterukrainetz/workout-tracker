'use client'

import Modal from './Modal'
import { Exercise } from '@/lib/types'

type ExerciseMenuProps = {
    isOpen: boolean
    onClose: () => void
    exercises: Exercise[]
    onSelect: (exerciseId: number) => void
    onAddNew: () => void
}

export default function ExerciseMenuModal({ isOpen, onClose, exercises, onSelect, onAddNew }:
    ExerciseMenuProps) {
        return (
            <Modal isOpen={isOpen} onClose={onClose}>
                <h1>Select an exercise</h1>
                <button onClick={onAddNew}>+ Create New Exercise</button>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'clamp(200px, 50vh, 500px)',
                    overflowY: 'auto'
                }}>
                    {exercises.map((ex) => (
                        <button key={ex.id} onClick={() => onSelect(ex.id)}>{ex.name}</button>
                    ))}
                </div>
            </Modal>
        )
    }