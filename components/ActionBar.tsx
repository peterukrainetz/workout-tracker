'use client'

type ActionBarProps = {
    count: number,
    onMarkComplete: () => void,
    onDuplicate: () => void,
    onDelete: () => void,
    onDeselect: () => void
}

export default function ActionBar({ count, onMarkComplete, onDuplicate, onDelete, onDeselect }: ActionBarProps) {
    if (count === 0) return null

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
            <span>{count} workouts selected</span>
            <button onClick={onMarkComplete}>Mark Complete</button>
            <button onClick={onDuplicate}>Duplicate</button>
            <button onClick={onDelete}>Delete</button>
            <button onClick={onDeselect}>X</button>
        </div>
    )
}