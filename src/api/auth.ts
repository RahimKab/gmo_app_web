import { apiPost } from './client'
import type { AuthUser } from '../contexts/AuthContext'

export type AuthResponse = {
  token: string
  user: AuthUser
}

type LoginRequestPayload = {
  email: string
  password: string
}

type RegisterRequestPayload = {
  nom: string
  prenom: string
  username: string
  email: string
  password: string
}

function normalizePath(path: string): string {
  if (path.startsWith('/')) {
    return path
  }

  return `/${path}`
}

const LOGIN_PATH = normalizePath(import.meta.env.VITE_LOGIN_PATH ?? '/auth/login/')
const REGISTER_PATH = normalizePath(import.meta.env.VITE_REGISTER_PATH ?? '/auth/register/')

export async function loginWithEmail(payload: LoginRequestPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse, LoginRequestPayload>(LOGIN_PATH, payload)
}

export async function registerWithFields(payload: RegisterRequestPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse, RegisterRequestPayload>(REGISTER_PATH, payload)
}
