'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import Modal from './Modal'
import { useRouter } from 'next/navigation'
import { UserRound, Plus, House,
        NotebookText, Weight,
        CalendarDays, Medal,
        Calculator, Timer } from 'lucide-react'

type SidebarProps = {
    isExpanded: boolean
    setIsExpanded: (value: boolean) => void
}

export default function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
    const [showWorkoutPicker, setShowWorkoutPicker] = useState(false)
    const { user } = useAuth()
    const router = useRouter()

    const liStyle = { paddingBottom: '15px' }
    const descStyle = { paddingLeft: '1rem' }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <>
            <div onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                onClick={() => setIsExpanded(false)}
            >
                <nav style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    width: isExpanded ? '150px' : '56px',
                    padding: '1rem',
                    borderRight: '1px solid #333',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.2s ease-in-out',
                    overflowX: 'hidden'
                }}>
                    <button style={{ marginLeft: '-4px', paddingBottom: '2rem' }} onClick={() => router.push('/signin')}>
                        <UserRound style={{
                            padding: '.5rem',
                            border: '1px solid #333',
                            borderRadius: '50%'
                        }}
                            size={'2.25rem'}/>
                    </button>

                    <ul style={{
                        padding: 0,
                        display: 'flex',
                        listStyle: 'none',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                    }}>
                        <Link href="/signup"></Link>
                        <li>
                            <button style={{ cursor: 'pointer', paddingBottom: '12px' }}
                                onClick={() => setShowWorkoutPicker(true)}
                            >
                                <div style={{ display: 'flex' }}>
                                    <Plus size={'1.5rem'}/>
                                        <p style={descStyle}>Create</p>
                                </div>
                            </button>
                        </li>
                        <li style={liStyle}>
                            <Link href="/">
                                <div style={{ display: 'flex' }}>
                                    <House size={'1.5rem'}/>
                                        <p style={descStyle}>Dashboard</p>
                                </div>
                            </Link>
                        </li>
                        <li style={liStyle}>
                            <Link href="/workouts">
                                <div style={{ display: 'flex' }}>
                                    <NotebookText size={'1.5rem'}/>
                                        <p style={descStyle}>Workouts</p>
                                </div>
                            </Link>
                        </li>
                        <li style={liStyle}>
                            <Link href="/exercises">
                                <div style={{ display: 'flex' }}>
                                    <Weight size={'1.5rem'}/>
                                        <p style={descStyle}>Exercises</p>
                                </div>
                            </Link>
                        </li>
                        <li style={liStyle}>
                            <Link href="/calendar">
                                <div style={{ display: 'flex' }}>
                                    <CalendarDays size={'1.5rem'}/>
                                        <p style={descStyle}>Calendar</p>
                                </div>
                            </Link>
                        </li>
                        <li style={liStyle}>
                            <Link href="/goals">
                                <div style={{ display: 'flex' }}>
                                    <Medal size={'1.5rem'}/>
                                        <p style={descStyle}>Goals</p>
                                </div>
                            </Link>
                        </li>
                        <li style={liStyle}>
                            <Link href="/calculator">
                                <div style={{ display: 'flex' }}>
                                    <Calculator size={'1.5rem'}/>
                                        <p style={descStyle}>Calculator</p>
                                </div>
                            </Link>
                        </li>
                        <li style={liStyle}>
                            <Link href="/timer">
                                <div style={{ display: 'flex' }}>
                                    <Timer size={'1.5rem'}/>
                                        <p style={descStyle}>Timer</p>
                                </div>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

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