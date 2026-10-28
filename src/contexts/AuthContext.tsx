import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './authContext'

import type { AuthUser } from './authContext'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

function readStorage(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
  const user = raw ? (JSON.parse(raw) as AuthUser) : null
  return { token, user }
}

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
