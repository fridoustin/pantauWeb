"use client"
import { createClient } from "@/utils/supabase/client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type User = {
  name: string
  email: string
} | null

type UserContextType = {
  user: User
  loading: boolean
  error: string | null
  refetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  refetchUser: async () => {},
})

// Utility to safely interact with localStorage (to handle SSR)
const getFromStorage = (key: string) => {
  if (typeof window === "undefined") return null
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (e) {
    console.error("Error getting from localStorage", e)
    return null
  }
}

const setToStorage = (key: string, value: any) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error("Error setting to localStorage", e)
  }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Start with null instead of trying to get from localStorage
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Track if component is mounted to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false)

  // Initialize client-side data after hydration
  useEffect(() => {
    setIsMounted(true)
    // Now try to get from localStorage after component is mounted
    const cachedUser = getFromStorage("userData")
    if (cachedUser) {
      setUser(cachedUser)
      setLoading(false)
    } else {
      fetchUser()
    }
  }, [])

  const fetchUser = async () => {
    if (typeof window === "undefined") return
    
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase.auth.getUser()
      
      if (fetchError) {
        setError(fetchError.message)
        setUser(null)
        setToStorage("userData", null)
        return
      }
      
      if (data?.user) {
        const userData = {
          name: data.user.user_metadata?.name || "No Name",
          email: data.user.email ?? "no-email@example.com",
        }
        setUser(userData)
        setToStorage("userData", userData)
      } else {
        setUser(null)
        setToStorage("userData", null)
      }
    } catch (err) {
      setError("Failed to fetch user data")
      console.error(err)
      setUser(null)
      setToStorage("userData", null)
    } finally {
      setLoading(false)
    }
  }

  // Set up auth state listener
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const supabase = createClient()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchUser()
        }
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setToStorage("userData", null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Provide default values during SSR to avoid hydration mismatch
  const contextValue = {
    user: isMounted ? user : null,
    loading: isMounted ? loading : true,
    error: isMounted ? error : null,
    refetchUser: fetchUser
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)