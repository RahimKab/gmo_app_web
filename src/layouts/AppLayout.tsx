import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navLinks = [
  { to: '/', label: 'Acceuil', end: true },
  { to: '/samples', label: 'Diagnostique' },
  { to: '/reports', label: 'Rapports' },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="kicker">GMO Detection</p>
          <h1>Console du laboratoire</h1>
        </div>
        <nav className="main-nav" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-header__user">
          {user && (
            <span className="user-info">
              {user.prenom} {user.nom}
              {user.role && <span className="user-role"> — {user.role.role_nom}</span>}
            </span>
          )}
          <button type="button" className="logout-button" onClick={handleLogout}>
            Deconnexion
          </button>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}
