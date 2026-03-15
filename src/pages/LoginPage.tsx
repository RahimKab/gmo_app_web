import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmail } from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

type LoginState = 'idle' | 'submitting'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loginState, setLoginState] = useState<LoginState>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email et Mot de passe sont requis.')
      return
    }

    setErrorMessage('')
    setLoginState('submitting')

    try {
      const { token, user } = await loginWithEmail({ email: email.trim(), password })
      login(token, user, rememberMe)
      navigate('/', { replace: true })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? `${error.message})`
          : 'Impossible de se connecter au backend.'

      setErrorMessage(message)
      setLoginState('idle')
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__background" aria-hidden="true" />

      <main className="login-card" aria-labelledby="login-title">
        <p className="login-card__kicker">Acces securise</p>
        <h1 id="login-title">Connexion a GMO Detection</h1>
        <p className="login-card__subtitle">
          Utilisez votre compte laboratoire pour acceder aux echantillons et aux rapports.
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="lab.analyst@domain.tld"
            />
          </label>

          <label className="field" htmlFor="password">
            <span>Mot de passe</span>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Entrez votre mot de passe"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </label>

          <div className="login-form__row">
            <label className="remember-me" htmlFor="remember-me">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" className="forgot-link" onClick={(event) => event.preventDefault()}>
              Mot de passe oublie ?
            </a>
          </div>

          {errorMessage ? (
            <p className="form-feedback form-feedback--error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button type="submit" className="submit-button" disabled={loginState === 'submitting'}>
            {loginState === 'submitting' ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="login-footer">
          Besoin d'un compte ? <Link to="/register">Creer un compte</Link>
        </p>

        <p className="login-footer login-footer--secondary">
          Retour a <Link to="/">l'acceuil</Link>
        </p>
      </main>
    </div>
  )
}
