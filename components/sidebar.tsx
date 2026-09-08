'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Sidebar() {
    const [isSignedIn, setIsSignedIn] = useState(false)
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
        setIsSignedIn(!!user)
        })
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    return (
        <nav style={{ width: '200px', padding: '1rem', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {!isSignedIn && <Link href="/login">Sign In</Link>}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><Link href="/log">+ Create Workout</Link></li>
                <li><Link href="/">Workouts</Link></li>
                <li><Link href="/">Dashboard</Link></li>
                <li><Link href="/exercises">Exercises</Link></li>
                <li><Link href="/calendar">Calendar</Link></li>
                <li><Link href="/goals">Goals</Link></li>
                <li>Tools</li>
                <li style={{ paddingLeft: '1rem' }}><Link href="/1rm">1RM Tool</Link></li>
                <li style={{ paddingLeft: '1rem' }}><Link href="/calculator">Calculator</Link></li>
                <li style={{ paddingLeft: '1rem' }}><Link href="/timer">Timer</Link></li>
            </ul>

            {isSignedIn && (
                <button onClick={handleLogout} style={{ marginTop: 'auto' }}>Sign Out</button>
            )}
        </nav>
    )
}