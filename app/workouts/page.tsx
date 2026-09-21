'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import WorkoutCard from '@/components/WorkoutCard'
import TemplateCard from '@/components/TemplateCard'
import { Workout, Template } from '@/lib/types'
import { CircleChevronRight, CircleChevronDown } from 'lucide-react'

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesIsOpen, setTemplatesIsOpen] = useState(true)
  const [workoutsIsOpen, setWorkoutsIsOpen] = useState(true)

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
    <div style={{ padding: '2rem', width: '90vw', justifyItems: 'center' }}>
      <div style={{ display: 'flex' }}>
        <h1 style={{ marginBottom: '1rem', paddingRight: '5px' }}>Templates</h1>
        <button
          style={{ marginTop: '-16px'}}
          onClick={() => setTemplatesIsOpen(!templatesIsOpen)}
        >
          {templatesIsOpen ? (
              <CircleChevronDown size={'1rem'}/>
          ) : (
              <CircleChevronRight size={'1rem'}/>
          )}
        </button>
      </div>

      {templatesIsOpen && (
        <div style={{ justifyItems: 'left' }}>
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
        </div>
      )}

      <div style={{ display: 'flex' }}>
        <h1 style={{ marginBottom: '1rem', paddingRight: '5px' }}>Workouts</h1>
        <button
          style={{ marginTop: '-16px'}}
          onClick={() => setWorkoutsIsOpen(!workoutsIsOpen)}
        >
          {workoutsIsOpen ? (
              <CircleChevronDown size={'1rem'}/>
          ) : (
              <CircleChevronRight size={'1rem'}/>
          )}
        </button>
      </div>

      {workoutsIsOpen && (
        <div style={{ justifyItems: 'left' }}>
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
      )}
    </div>
  )
}