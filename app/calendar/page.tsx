'use client'

import { DayPicker, DayButton, type DayButtonProps } from 'react-day-picker'
import 'react-day-picker/style.css'
import './calendar.css'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Workout } from '@/lib/types'
import { toLocalDateString, formatDateForDisplay } from '@/lib/date'
import Modal from '@/components/Modal'
import WorkoutCard from '@/components/WorkoutCard'

export default function Calendar() {
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [showWorkouts, setShowWorkouts] = useState(false)

    useEffect(() => {
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        const firstDayStr = toLocalDateString(firstDay)
        const lastDayStr = toLocalDateString(lastDay)

        supabase
            .from ('logged_workouts')
            .select('id, date, name, completed, logged_sets(id, weight, reps, exercises(name))')
            .gte('date', firstDayStr).lte('date', lastDayStr)
            .then(({ data }) => {
                if (data) setWorkouts(data as unknown as Workout[])
            })
    }, [currentMonth])

    const workoutsByDate: Record<string, Workout[]> = {}
    for (const w of workouts) {
        const dateKey = w.date.split('T')[0]

        if (!workoutsByDate[dateKey]) {
            workoutsByDate[dateKey] = []
        }

        workoutsByDate[dateKey].push(w)
    }

    const selectedDayWorkouts = selectedDay ? (
            workoutsByDate[toLocalDateString(selectedDay)]
        ) ?? (
            []
        ) : ( 
            []
        )

    function CustomDayButton(props: DayButtonProps) {
        const { day, modifiers, ...buttonProps } = props
        const dateKey = toLocalDateString(day.date)
        const dayWorkouts = workoutsByDate[dateKey] ?? []

        return (
            <DayButton day={day} modifiers={modifiers} {...buttonProps}>
                <div style={{
                    height: '100%',
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #333',
                    borderRadius: '20%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    overflow: 'hidden'
                }}>
                    <div>{day.date.getDate()}</div>
                    {dayWorkouts.map((w) => (
                        <div key={w.id} style={{
                            width: '100%',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            padding: '1%',
                            border: '1px solid #333',
                            borderRadius: '5px',
                        }}>
                            {w.name}
                        </div>
                    ))}
                </div>
            </DayButton>
        )
    }

    return (
        <>
            <div style={{ alignSelf: 'center' }}>
                <DayPicker
                    animate
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    onDayClick={(day) => {
                        setShowWorkouts(true)
                        setSelectedDay(day)
                    }}
                    components={{ DayButton: CustomDayButton }}
                />
            </div>

            <Modal
                isOpen={showWorkouts}
                onClose={() => setShowWorkouts(false)}
            >
                <h1 style={{ paddingBottom: '1rem' }}>
                    Workouts for
                    {selectedDay &&
                        ' ' + formatDateForDisplay(toLocalDateString(selectedDay))
                    }
                </h1>

                {selectedDayWorkouts.length === 0 && <p>No workouts</p>}
                {selectedDayWorkouts.map((w) => (
                    <WorkoutCard
                        key={w.id}
                        workout={w}
                        isSelected={false}
                        onToggleSelect={() => {return}}
                        onCompleted={(id, completed) => {
                            setWorkouts(
                            selectedDayWorkouts.map((w) => 
                                w.id === id ? { ...w, completed } : w
                            )
                            )
                        }}
                    />
                ))}
            </Modal>
        </>
    )
}