import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Items from './pages/Items'
import Admin from './pages/Admin'
import { getCurrentUser, logout } from './api/auth'
import { isAuthenticated } from './utils/auth'
import { isAdmin } from './utils/roles'
import NotFound from './pages/NotFound'
import AccessDenied from './pages/AccessDenied'

function SessionLoading({ error, onRetry }) {
  if (error) {
    return <main className="session-loading"><div><p>{error}</p><button className="text-button" type="button" onClick={onRetry}>Try again →</button></div></main>
  }
  return <main className="session-loading">Checking your session…</main>
}

function ProtectedRoute({ user, isLoading, sessionError, onRetry, children }) {
  const location = useLocation()
  if (isLoading || sessionError) return <SessionLoading error={sessionError} onRetry={onRetry} />
  return isAuthenticated(user) ? children : <Navigate to="/auth" state={{ from: location }} replace />
}

function AuthRoute({ user, isLoading, sessionError, onRetry, children }) {
  if (isLoading || sessionError) return <SessionLoading error={sessionError} onRetry={onRetry} />
  return isAuthenticated(user) ? <Navigate to="/items" replace /> : children
}

function AdminRoute({ user, isLoading, sessionError, onRetry, children }) {
  const location = useLocation()
  if (isLoading || sessionError) return <SessionLoading error={sessionError} onRetry={onRetry} />
  if (!isAuthenticated(user)) return <Navigate to="/auth" state={{ from: location }} replace />
  return isAdmin(user) ? children : <Navigate to="/access-denied" replace />
}

export default function App() {
  const [user, setUser] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')

  const refreshSession = useCallback(async () => {
    setIsLoadingSession(true)
    setSessionError('')
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setSessionError('')
      return currentUser
    } catch {
      setUser(null)
      setSessionError('We could not verify your session. Please try again.')
      return null
    } finally {
      setIsLoadingSession(false)
    }
  }, [])

  useEffect(() => { refreshSession() }, [refreshSession])

  async function handleLogout() {
    await logout()
    setUser(null)
  }

  return (
    <Routes>
      <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
      <Route path="/auth" element={<AuthRoute user={user} isLoading={isLoadingSession} sessionError={sessionError} onRetry={refreshSession}><Auth onAuthenticated={setUser} /></AuthRoute>} />
      <Route path="/items" element={<ProtectedRoute user={user} isLoading={isLoadingSession} sessionError={sessionError} onRetry={refreshSession}><Items currentUser={user} onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute user={user} isLoading={isLoadingSession} sessionError={sessionError} onRetry={refreshSession}><Admin currentUser={user} onLogout={handleLogout} onSessionChanged={refreshSession} /></AdminRoute>} />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
