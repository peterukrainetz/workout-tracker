export type Exercise = {
      id: number
      name: string
      description: string
      user_id: string
}

export type Workout = {
  id: number
  date: string
  name: string | null
  logged_sets: {
    id: number
    weight: number
    reps: number
    exercises: { name: string } | null
  }[]
  completed: boolean
}

export type Template = {
  id: number
  name: string | null
  description: string | null
  template_sets: {
    id: number
    weight: number
    reps: number
    exercise_id: number | null
    exercises: { name: string } | null
  }[]
}