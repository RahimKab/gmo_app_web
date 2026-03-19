import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import App from '../App'
import { AppLayout } from '../layouts/AppLayout'
import { HomePage } from '../pages/HomePage'
import { DiagnostiquePage } from '../pages/DiagnostiquePage'
import { ReportsPage } from '../pages/ReportsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { LoginPage } from '../pages/LoginPage'
import { RegistrationPage } from '../pages/RegistrationPage'
import { useAuth } from '../contexts/AuthContext'

function RequireAuth() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegistrationPage />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: <HomePage />,
              },
              {
                path: 'diagnostique',
                element: <DiagnostiquePage />,
              },
              {
                path: 'reports',
                element: <ReportsPage />,
              },
              {
                path: '*',
                element: <NotFoundPage />,
              },
            ],
          },
        ],
      },
    ],
  },
])
