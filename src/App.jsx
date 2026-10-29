import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Items from './pages/Items'
import { isAuthenticated } from './utils/auth'

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />
}

function AuthRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/items" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
