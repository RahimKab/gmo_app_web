import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type AuthRole = {
  role_id: number
  role_code: string
  role_nom: string
}

export type AuthUser = {
  user_id: number
  nom: string
  prenom: string
  username: string
  email: string
  user_actif: boolean
  role: AuthRole | null
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser, remember: boolean) => void
  logout: () => void
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

function readStorage(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
  const user = raw ? (JSON.parse(raw) as AuthUser) : null
  return { token, user }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readStorage()
  const [token, setToken] = useState<string | null>(stored.token)
  const [user, setUser] = useState<AuthUser | null>(stored.user)

  function login(newToken: string, newUser: AuthUser, remember: boolean): void {
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(TOKEN_KEY, newToken)
    storage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
