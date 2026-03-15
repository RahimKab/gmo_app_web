import { Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default App
