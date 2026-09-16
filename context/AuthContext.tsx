'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
    user: User | null
    setUser: (user: User | null) => void
    username: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [username, setUsername] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (!user) {
            setUsername(null)
            return
        }

        supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single()
            .then(({ data, error }) => { 
                if (error) {
                    setUsername(null)
                    return
                }
                setUsername(data.username)
            })
    }, [user])

    return (
        <AuthContext.Provider value={{ user, setUser, username }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context)
        throw new Error('useAuth must be used inside an AuthProvider')

    return context
}