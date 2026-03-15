import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getBackendHealth } from '../api/system'

type BackendStatus = 'checking' | 'online' | 'offline'

export function HomePage() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking')
  const [backendMessage, setBackendMessage] = useState('Verification du statut du backend...')

  useEffect(() => {
    let isMounted = true

    async function checkBackendStatus(): Promise<void> {
      try {
        const status = await getBackendHealth()

        if (!isMounted) {
          return
        }

        setBackendStatus('online')
        setBackendMessage(`Backend accessible (${status}).`)
      } catch (error) {
        if (!isMounted) {
          return
        }

        const message =
          error instanceof ApiError
            ? `${error.message} (HTTP ${error.status})`
            : 'Impossible de joindre le backend Django.'

        setBackendStatus('offline')
        setBackendMessage(message)
      }
    }

    void checkBackendStatus()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section>
      <h2>Routage et connexion backend prets</h2>
      <p>
        Ce projet utilise desormais des routes imbriquees avec un layout partage,
        ce qui facilite l'ajout de nouveaux modules a mesure que l'application evolue.
      </p>

      <div className={`status-card status-card--${backendStatus}`}>
        <h3>Django API</h3>
        <p>{backendMessage}</p>
      </div>

      <div className="quick-links">
        <Link to="/samples" className="action-link">
          Aller aux echantillons
        </Link>
        <Link to="/reports" className="action-link action-link--secondary">
          Aller aux rapports
        </Link>
      </div>
    </section>
  )
}
