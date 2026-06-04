import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getBackendHealth } from '../api/system'

type BackendStatus = 'checking' | 'online' | 'offline'

export function HomePage() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking')
  const [backendMessage, setBackendMessage] = useState('Vérification du statut du backend...')

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
            ? `${error.message}`
            : 'API inaccessible, VERIFEZ VOTRE CONNEXION.'

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
    <section className="home">
      <article className="home-hero">
        <div className="hero-copy">
          <span className="badge">[ SYS // DETECTION OGM ]</span>
          <p className="hero-sys-tag">ADN-ANALYTICS v0.0 &mdash; PLATEFORME DE DIAGNOSTIC</p>
          <h2>
            Centre de commande <span className="hero-highlight">ADN</span> &mdash;
            decisions rapides, tracables et pretes au rapport.
          </h2>
          
          <div className="hero-actions">
            <Link to="/diagnostique" className="action-link">
              &rsaquo;&rsaquo; Lancer un diagnostic
            </Link>
            <Link to="/reports" className="action-link action-link--secondary">
              &rsaquo;&rsaquo; Consulter les rapports
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>89.6%</strong>
              <span>PRECISION</span>
            </div>
            <div className="hero-stat">
              <strong>10s</strong>
              <span>LATENCE</span>
            </div>
            <div className="hero-stat">
              <strong>PDF</strong>
              <span>RAPPORT AUTO</span>
            </div>
          </div>
        </div>

        <aside className="hero-visual">
          <div className="helix" aria-hidden="true">
            <span className="helix__rung" />
            <span className="helix__rung" />
            <span className="helix__rung" />
            <span className="helix__rung" />
            <span className="helix__rung" />
            <span className="helix__rung" />
            <span className="helix__rung" />
            <span className="helix__rung" />
            <div className="helix__scan" aria-hidden="true" />
          </div>
          <div className="hero-telemetry">
            <p>
              <span>&#9658; API</span>
              <strong className={`tele-status tele-status--${backendStatus}`}>
                {backendStatus === 'online'
                  ? '● EN LIGNE'
                  : backendStatus === 'offline'
                    ? '✗ HORS LIGNE'
                    : '◯ VERIFICATION...'}
              </strong>
            </p>
            <p>
              <span>&#9658; MODELE</span>
              <strong>OGM / NON-OGM</strong>
            </p>
            <p>
              <span>&#9658; SORTIE</span>
              <strong>RAPPORT PDF + ATTENTION</strong>
            </p>
          </div>
        </aside>
      </article>

      <section className="feature-grid">
        <article className="feature-card feature-card--accent">
          <span className="fcard-index">[01] INGESTION</span>
          <h3>Import des sequences</h3>
          <p>Deposez FASTA/FNA/TXT ou collez une sequence brute, puis lancez l&apos;analyse.</p>
        </article>
        <article className="feature-card feature-card--accent">
          <span className="fcard-index">[02] INFERENCE</span>
          <h3>Diagnostic intelligent</h3>
          <p>Le modele calcule les probabilites OGM/Non-OGM et detecte les zones d&apos;attention.</p>
        </article>
        <article className="feature-card feature-card--accent">
          <span className="fcard-index">[03] RAPPORT</span>
          <h3>Rapport exploitable</h3>
          <p>Chaque prediction est conservee avec un PDF.</p>
        </article>
      </section>

    </section>
  )
}
