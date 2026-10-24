'use client'

import { X, Trash, Copy, CircleCheck } from 'lucide-react'

type ActionBarProps = {
    count: number,
    onMarkComplete: () => void,
    onDuplicate: () => void,
    onDelete: () => void,
    onDeselect: () => void
}

export default function ActionBar({ count, onMarkComplete, onDuplicate, onDelete, onDeselect }: ActionBarProps) {
    if (count === 0) return null

    const buttonStyle = { cursor: 'pointer', marginLeft: '1rem' }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            padding: '1rem',
            background: '#222',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <span>{count} {count > 1 ? 'workouts' : 'workout'} selected</span>
            <button style={buttonStyle} onClick={onMarkComplete}><CircleCheck size={'1.5rem'} /></button>
            <button style={buttonStyle} onClick={onDuplicate}><Copy size={'1.5rem'} /></button>
            <button style={buttonStyle} onClick={onDelete}><Trash size={'1.5rem'} /></button>
            <button style={buttonStyle} onClick={onDeselect}><X size={'1.5rem'} /></button>
        </div>
    )
}