import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section>
      <h2>Page introuvable</h2>
      <p>La route demandee n'existe pas.</p>
      <Link to="/" className="action-link">
        Retour a la vue generale
      </Link>
    </section>
  )
}
