# Workout Tracker

A fullstack web app that allows users of all skill level to plan and log their workouts in any way they like. Also includes built-in tools such as a one-rep max calculator, timer, etc. Designed to be flexible enough to fit any and every lifter's needs.

**Live demo:** [workout-tracker-eta-snowy.vercel.app](https://workout-tracker-eta-snowy.vercel.app/)

## Features

- ✅ User authentication
- ✅ Future workout planning
- ✅ Recent workout logging
- ✅ Workout history page
- 🔲 Custom exercise creation
- Tools:
  - 🔲 1RM calculator
  - 🔲 Weight to plate calculator
  - 🔲 Timer

**Keep in mind features are contantly being updated!**

## Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API routes
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Hosting:** [Vercel](https://vercel.com/)

## Data Model

```
exercises          (id, name, category, user_id [nullable — null = shared default])
logged_workouts    (id, user_id, date, notes)
logged_sets        (id, logged_workout_id, exercise_id, set_number, weight, reps)
```

- `exercises` supports both shared default exercises and user-created custom ones.
- `logged_workouts` and `logged_sets` are scoped to the logged-in user via Row Level Security — users can only ever see or edit their own data.

## Running Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/peterukrainetz/workout-tracker.git
   cd workout-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the project root with your own Supabase project credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Project Status

This project is under active development as a learning project and portfolio piece. Progress updates are posted on [LinkedIn](https://www.linkedin.com/in/pukrainetz/).

## About

Built by [Peter Ukrainetz](https://github.com/peterukrainetz) as a way to learn fullstack web development (Next.js, React, Supabase) while building something useful and personally fulfilling.
