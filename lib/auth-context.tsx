"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserRole = "admin" | "student"

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
}

interface AuthContextType {
  user: AppUser | null
  supabaseUser: SupabaseUser | null
  login: (email: string, password: string) => Promise<{ error?: string; role?: string }>
  signup: (email: string, password: string, metadata: { name: string; role: UserRole; department?: string }) => Promise<{ error?: string; role?: string }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getSession() {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser()
        if (sbUser) {
          setSupabaseUser(sbUser)
          // Fetch profile from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sbUser.id)
            .single()

          if (profile) {
            setUser({
              id: sbUser.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole,
              department: profile.department ?? undefined,
            })
          }
        }
      } catch {
        // ignore
      }
      setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profile) {
          setUser({
            id: session.user.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            department: profile.department ?? undefined,
          })
        }
      } else {
        setSupabaseUser(null)
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: error.message }
    }
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profile) {
        const appUser: AppUser = {
          id: data.user.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as UserRole,
          department: profile.department ?? undefined,
        }
        setUser(appUser)
        setSupabaseUser(data.user)
        return { role: appUser.role }
      }
    }
    return { error: "Could not load user profile." }
  }, [supabase])

  const signup = useCallback(async (
    email: string,
    password: string,
    metadata: { name: string; role: UserRole; department?: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: metadata.name,
          role: metadata.role,
          department: metadata.department,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profile) {
        const appUser: AppUser = {
          id: data.user.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as UserRole,
          department: profile.department ?? undefined,
        }
        setUser(appUser)
        setSupabaseUser(data.user)
        return { role: appUser.role }
      }
    }

    return { error: "Account created. Please check your email to confirm, then log in." }
  }, [supabase])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, supabaseUser, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
