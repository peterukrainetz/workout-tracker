'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import Modal from './Modal'
import { useRouter } from 'next/navigation'
import { Plus, House, NotebookText, Weight, CalendarDays, Check } from 'lucide-react'

type SidebarProps = {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    const [showWorkoutPicker, setShowWorkoutPicker] = useState(false)
    const { user } = useAuth()
    const router = useRouter()

    const liStyle = { paddingBottom: '15px' }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <>
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                minWidth: isCollapsed ? '0px' : '70px',
                padding: '1rem',
                borderRight: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 1s ease-in-out, padding 1s ease-in-out'
            }}>
                {!user &&
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <Link href="/signin">Sign In</Link>
                        <p>|</p>
                        <Link href="/signup">Sign Up</Link>
                    </div>
                }

                {!isCollapsed && (
                    <>
                        <ul style={{
                            padding: 0,
                            display: 'flex',
                            listStyle: 'none',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                            <li>
                                <button style={{ cursor: 'pointer', paddingBottom: '12px' }}
                                    onClick={() => setShowWorkoutPicker(true)}
                                >
                                    <Plus size={'1.5rem'}/>
                                </button>
                            </li>
                            <li style={liStyle}><Link href="/"><House size={'1.5rem'}/></Link></li>
                            <li style={liStyle}><Link href="/workouts"><NotebookText size={'1.5rem'}/></Link></li>
                            <li style={liStyle}><Link href="/exercises"><Weight size={'1.5rem'}/></Link></li>
                            <li style={liStyle}><Link href="/calendar"><CalendarDays size={'1.5rem'}/></Link></li>
                            <li style={liStyle}><Link href="/goals"><Check size={'1.5rem'}/></Link></li>
                            <li>Tools</li>
                            <li style={{ paddingLeft: '1rem' }}><Link href="/1rm">1RM Tool</Link></li>
                            <li style={{ paddingLeft: '1rem' }}><Link href="/calculator">Calculator</Link></li>
                            <li style={{ paddingLeft: '1rem' }}><Link href="/timer">Timer</Link></li>
                        </ul>

                        {user && 
                            <button onClick={handleLogout} style={{ marginTop: 'auto' }}>Sign Out</button>}
                    </>
               )}
            </nav>

            <Modal isOpen={showWorkoutPicker} onClose={() => setShowWorkoutPicker(false)}>
                <h1 style={{ justifySelf: 'center' }}>Create</h1>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    width: '20vw',
                    height: '20vh'
                }}>
                    <button onClick={() => {
                        router.push('/create-workout')
                        setShowWorkoutPicker(false)
                    }}>
                        Workout
                    </button>

                    <button onClick={() => {
                        router.push('/create-template')
                        setShowWorkoutPicker(false)
                    }}>
                        Template
                    </button>
                </div>
            </Modal>
        </>
    )
}