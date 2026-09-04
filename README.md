# Workout Tracker

A fullstack workout tracking web app built to help lifters log workouts, plan future sessions, and track progress over time — with built-in tools like a one-rep max (1RM) calculator. Designed to be flexible enough to fit however you personally like to train.

**Live demo:** [workout-tracker-eta-snowy.vercel.app](https://workout-tracker-eta-snowy.vercel.app/)

## Features

- ✅ User authentication (sign up, log in, log out)
- ✅ Secure, per-user data access (Row Level Security)
- 🔲 Workout logging (sets, reps, weight)
- 🔲 Workout history view
- 🔲 1RM (one-rep max) calculator
- 🔲 Workout planning / templates
- 🔲 Custom exercise creation

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

This project is under active development as a learning project and portfolio piece. Progress updates are posted on [LinkedIn](#).

## About

Built by [Peter Ukrainetz](https://github.com/peterukrainetz) as a way to learn fullstack web development (Next.js, React, Supabase) while building something genuinely useful for tracking lifting progress.
