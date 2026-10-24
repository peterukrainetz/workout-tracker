'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import WorkoutCard from '@/components/WorkoutCard'
import TemplateCard from '@/components/TemplateCard'
import { Workout, Template } from '@/lib/types'
import { CircleChevronRight, CircleChevronDown } from 'lucide-react'
import Modal from '@/components/Modal'
import ActionBar from '@/components/ActionBar'

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesIsOpen, setTemplatesIsOpen] = useState(true)
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<number>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [workoutsIsOpen, setWorkoutsIsOpen] = useState(true)

  useEffect(() => {
      loadWorkouts()
      loadTemplates()
  }, [])
  
  const loadWorkouts = async () => {
    supabase
      .from('logged_workouts')
      .select('id, date, name, completed, logged_sets(id, weight, reps, exercises(name))')
      .order('date', { ascending: false})
      .then(({ data }) => {
        if (data) setWorkouts(data as unknown as Workout[])
    })
  }

  const loadTemplates = async () => {
    supabase
      .from('workout_templates')
      .select('id, name, template_sets(id, weight, reps, exercise_id, exercises(name))')
      .order('name', { ascending: true})
      .then(({ data }) => {
        if (data) setTemplates(data as unknown as Template[])
      })
  }

  const handleBulkComplete = async () => {
      const { error: updateError } = await supabase
        .from('logged_workouts')
        .update({ completed: true })
        .in('id', [...selectedWorkouts])

      if (updateError)
      {
        setError(updateError.message)
        return
      }

      loadWorkouts()
      setSelectedWorkouts(new Set())
    }

  const handleBulkDelete = async () => {
      const { error: deleteError } = await supabase
        .from('logged_workouts')
        .delete()
        .in('id', [...selectedWorkouts])

      if (deleteError)
      {
        setError(deleteError.message)
        return
      }

      loadWorkouts()
      setSelectedWorkouts(new Set())
  }

  const handleBulkDuplicate = async () => {
    const { data: workoutsToDuplicate, error : fetchError } = await supabase
      .from('logged_workouts')
      .select('user_id, date, name, notes, logged_sets(logged_workout_id, weight, reps, exercise_id, set_number)')
      .in ('id', [...selectedWorkouts])

      if (fetchError)
      {
        setError(fetchError.message)
        return
      }

      const duplicatedWorkouts = workoutsToDuplicate.map((w) => ({
        user_id: w.user_id,
        name: w.name,
        notes: w.notes,
        date: w.date
      }))

      const { data : newIds, error : insertError } = await supabase
        .from('logged_workouts')
        .insert([...duplicatedWorkouts])
        .select('id')

      if (insertError)
      {
        setError(insertError.message)
        return
      }

      const newSets = workoutsToDuplicate.flatMap((w, i) => 
        w.logged_sets.map((s) => ({
          logged_workout_id: newIds[i].id,
          weight: s.weight,
          reps: s.reps,
          exercise_id: s.exercise_id,
          set_number: s.set_number
        }))
      )

      if (newSets.length > 0) {
        const { error : setInsertError } = await supabase
          .from('logged_sets')
          .insert([...newSets])

        if (setInsertError)
        {
          await supabase.from('logged_workouts').delete().in('id', newIds.map((n) => n.id))
          setError(setInsertError.message)
          return
        }
      }

      loadWorkouts()
      setSelectedWorkouts(new Set())
    }

  return (
    <>
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
                  isSelected={selectedWorkouts.has(w.id)}
                  onToggleSelect={() => {
                    setSelectedWorkouts((prev) => {
                      const next = new Set(prev)
                      if (next.has(w.id)) next.delete(w.id)
                      else next.add(w.id)
                      return next
                    })
                  }}
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

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ActionBar
        count={selectedWorkouts.size}
        onMarkComplete={() => handleBulkComplete()}
        onDuplicate={() => handleBulkDuplicate()}
        onDelete={() => setShowDeleteConfirm(true)}
        onDeselect={() => setSelectedWorkouts(new Set())}
      />

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <h1>Confirm Delete</h1>
        <p>Are you sure you want to delete selected workout(s)? This cannot be undone.</p>
        <div style={{ display: 'flex', justifyContent: 'space-evenly'}}>
            <button onClick={() => {
              handleBulkDelete()
              setShowDeleteConfirm(false)
            }}>
              Delete
            </button>
            <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
        </div>
      </Modal>
    </>
  )
}