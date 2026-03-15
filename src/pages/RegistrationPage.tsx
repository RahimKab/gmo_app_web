import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithFields } from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

type RegisterState = 'idle' | 'submitting'

type RegisterFields = {
  nom: string
  prenom: string
  username: string
  email: string
  password: string
}

const initialFields: RegisterFields = {
  nom: '',
  prenom: '',
  username: '',
  email: '',
  password: '',
}

export function RegistrationPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [fields, setFields] = useState<RegisterFields>(initialFields)
  const [errorMessage, setErrorMessage] = useState('')
  const [registerState, setRegisterState] = useState<RegisterState>('idle')

  function updateField(field: keyof RegisterFields, value: string): void {
    setFields((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const hasEmptyRequiredField = Object.values(fields).some((value) => !value.trim())
    if (hasEmptyRequiredField) {
      setErrorMessage('Tous les champs sont obligatoires.')
      return
    }

    setErrorMessage('')
    setRegisterState('submitting')

    try {
      const { token, user } = await registerWithFields({
        nom: fields.nom.trim(),
        prenom: fields.prenom.trim(),
        username: fields.username.trim(),
        email: fields.email.trim(),
        password: fields.password,
      })

      login(token, user, false)
      navigate('/', { replace: true })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? `${error.message}`
          : 'Impossible de creer le compte sur le backend.'

      setErrorMessage(message)
      setRegisterState('idle')
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__background" aria-hidden="true" />

      <main className="login-card registration-card" aria-labelledby="register-title">
        <p className="login-card__kicker">Creation de compte</p>
        <h1 id="register-title">Inscription</h1>
        <p className="login-card__subtitle">Renseignez tous les champs pour creer votre compte.</p>

        <form className="login-form registration-form" onSubmit={handleSubmit} noValidate>
          <label className="field" htmlFor="nom">
            <span>Nom</span>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              value={fields.nom}
              onChange={(event) => updateField('nom', event.target.value)}
              placeholder="Dupont"
            />
          </label>

          <label className="field" htmlFor="prenom">
            <span>Prenom</span>
            <input
              id="prenom"
              name="prenom"
              type="text"
              required
              value={fields.prenom}
              onChange={(event) => updateField('prenom', event.target.value)}
              placeholder="Alice"
            />
          </label>

          <label className="field" htmlFor="username">
            <span>Nom d'utilisateur</span>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={fields.username}
              onChange={(event) => updateField('username', event.target.value)}
              placeholder="alice.dupont"
            />
          </label>

          <label className="field" htmlFor="register-email">
            <span>Email</span>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={fields.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="alice@laboratoire.fr"
            />
          </label>

          <label className="field registration-form__full" htmlFor="password">
            <span>Mot de passe</span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={fields.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Minimum 8 caracteres"
            />
          </label>

          {errorMessage ? (
            <p className="form-feedback form-feedback--error registration-form__full" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="submit-button registration-form__full"
            disabled={registerState === 'submitting'}
          >
            {registerState === 'submitting' ? 'Inscription en cours...' : "S'inscrire"}
          </button>
        </form>

        <p className="login-footer">
          Deja un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </main>
    </div>
  )
}

