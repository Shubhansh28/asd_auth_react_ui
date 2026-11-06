import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Items from './pages/Items'
import Admin from './pages/Admin'
import { getCurrentUser, logout } from './api/auth'
import { isAuthenticated } from './utils/auth'
import { isAdmin } from './utils/roles'

function SessionLoading() {
  return <main className="session-loading">Checking your session…</main>
}

function ProtectedRoute({ user, isLoading, children }) {
  if (isLoading) return <SessionLoading />
  return isAuthenticated(user) ? children : <Navigate to="/auth" replace />
}

function AuthRoute({ user, isLoading, children }) {
  if (isLoading) return <SessionLoading />
  return isAuthenticated(user) ? <Navigate to="/items" replace /> : children
}

function AdminRoute({ user, isLoading, children }) {
  if (isLoading) return <SessionLoading />
  if (!isAuthenticated(user)) return <Navigate to="/auth" replace />
  return isAdmin(user) ? children : <Navigate to="/items" replace />
}

export default function App() {
  const [user, setUser] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch {
      setUser(null)
      return null
    } finally {
      setIsLoadingSession(false)
    }
  }, [])

  useEffect(() => { refreshSession() }, [refreshSession])

  async function handleLogout() {
    try {
      await logout()
    } finally {
      setUser(null)
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
      <Route path="/auth" element={<AuthRoute user={user} isLoading={isLoadingSession}><Auth onAuthenticated={setUser} /></AuthRoute>} />
      <Route path="/items" element={<ProtectedRoute user={user} isLoading={isLoadingSession}><Items currentUser={user} onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute user={user} isLoading={isLoadingSession}><Admin currentUser={user} onLogout={handleLogout} onSessionChanged={refreshSession} /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
