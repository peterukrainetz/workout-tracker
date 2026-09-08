'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type SidebarProps = {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    const { user } = useAuth()

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: isCollapsed ? '60px' : '200px',
            padding: '1rem',
            borderRight: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <button onClick={() => setIsCollapsed(!isCollapsed)} style={{
                position: 'absolute',
                top: '1rem',
                right: '-12px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px solid #333',
                background: '#111'
            }}
            >
                {isCollapsed ? '→' : '←'}
            </button>

            {!user && <Link href="/login">Sign In</Link>}

            {!isCollapsed && (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li><Link href="/create">+ Create Workout</Link></li>
                    <li><Link href="/">Dashboard</Link></li>
                    <li><Link href="/workouts">Workouts</Link></li>
                    <li><Link href="/exercises">Exercises</Link></li>
                    <li><Link href="/calendar">Calendar</Link></li>
                    <li><Link href="/goals">Goals</Link></li>
                    <li>Tools</li>
                    <li style={{ paddingLeft: '1rem' }}><Link href="/1rm">1RM Tool</Link></li>
                    <li style={{ paddingLeft: '1rem' }}><Link href="/calculator">Calculator</Link></li>
                    <li style={{ paddingLeft: '1rem' }}><Link href="/timer">Timer</Link></li>
                </ul>
            )}

            {user && (
                <button onClick={handleLogout} style={{ marginTop: 'auto' }}>Sign Out</button>
            )}
        </nav>
    )
}