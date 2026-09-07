'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <nav style={{ width: '200px', padding: '1rem', borderRight: '1px solid #333' }}>
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
            <button onClick={handleLogout}>Sign Out</button>
        </nav>
    )
}