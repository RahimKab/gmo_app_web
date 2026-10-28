import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import { AppLayout } from '../layouts/AppLayout'
import { HomePage } from '../pages/HomePage'
import { DiagnostiquePage } from '../pages/DiagnostiquePage'
import { ReportsPage } from '../pages/ReportsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { LoginPage } from '../pages/LoginPage'
import { RegistrationPage } from '../pages/RegistrationPage'
import { RequireAuth } from './RequireAuth'

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
