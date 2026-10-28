import { createContext } from 'react'

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

export type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser, remember: boolean) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
