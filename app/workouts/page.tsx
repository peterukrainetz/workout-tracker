'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import WorkoutCard from '@/components/WorkoutCard'
import TemplateCard from '@/components/TemplateCard'
import { Workout, Template } from '@/lib/types'

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesIsOpen, setTemplatesIsOpen] = useState(true)

  useEffect(() => {
    // Read workout data associated with user
    supabase
      .from('logged_workouts')
      .select('id, date, name, completed, logged_sets(id, weight, reps, exercises(name))')
      .order('date', { ascending: false})
      .then(({ data }) => {
        if (data) setWorkouts(data as unknown as Workout[])
      })
  }, [])

  useEffect(() => {
    supabase
      .from('workout_templates')
      .select('id, name, template_sets(id, weight, reps, exercises(name))')
      .order('name', { ascending: true})
      .then(({ data }) => {
        if (data) setTemplates(data as unknown as Template[])
      })
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex' }}>
        <h1 style={{ marginBottom: '1rem', paddingRight: '20px' }}>Templates</h1>
        <button
          style={{ marginBottom: 'auto'}}
          onClick={() => setTemplatesIsOpen(!templatesIsOpen)}
        >
          {templatesIsOpen ? '⌄' : '>'}
        </button>
      </div>

      {templatesIsOpen && (
        <>
          {templates.length === 0 && <p>No templates. Add a template using the sidebar.</p>}
          {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isSelected={false}
                onToggleSelect={() => {return}}
                onInstantiate={() => {return}}
              />
          ))}
        </>
      )}

      <h1 style={{ marginBottom: '1rem' }}>Workouts</h1>
      {workouts.length === 0 && <p>No logged workouts. Add a workout using the sidebar.</p>}
      {workouts.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            isSelected={false}
            onToggleSelect={() => {return}}
            onCompleted={(id, completed) => {
              setWorkouts(
                workouts.map((w) => 
                  w.id === id ? { ...w, completed } : w
                )
              )
            }}
          />
      ))}
    </div>
  )
}