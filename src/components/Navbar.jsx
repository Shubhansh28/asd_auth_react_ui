import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function Navbar({ user, onReportItem, onLogout }) {
  const loggedIn = Boolean(user)
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await onLogout?.()
    } finally {
      navigate('/')
    }
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/" aria-label="Foundly home">
        <span className="brand-mark">✦</span>
        <span>Foundly</span>
      </Link>
      <nav aria-label="Main navigation">
        <NavLink to="/">Home</NavLink>
        {loggedIn ? (
          <>
            {onReportItem && <button className="nav-report" type="button" onClick={onReportItem}>Report item</button>}
            <button className="nav-logout" type="button" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/auth">Log in</Link>
            <Link className="nav-cta" to="/auth?mode=signup">Get started <span>→</span></Link>
          </>
        )}
      </nav>
    </header>
  )
}
