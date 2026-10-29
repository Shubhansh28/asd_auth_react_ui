import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { isAuthenticated } from '../utils/auth'

export default function Home() {
  const loggedIn = isAuthenticated()

  return (
    <main className="home-page">
      <div className="home-shell">
        <Navbar />
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> A little help goes a long way</p>
            <h1>Find what you’ve lost.<br /><em>Help what gets lost</em><br />find its way home.</h1>
            <p className="hero-description">A calm, caring space for your campus community to reconnect people with the things that matter.</p>
            <div className="hero-actions">
              <Link className="primary-button" to={loggedIn ? '/items' : '/auth'}>{loggedIn ? 'View lost items' : 'Get started'} <span>→</span></Link>
              {!loggedIn && <Link className="text-button" to="/auth">I have an account <span>→</span></Link>}
            </div>
          </div>
          <div className="hero-scene" aria-hidden="true">
            <div className="sun-glow" />
            <div className="cloud cloud-one" /><div className="cloud cloud-two" />
            <div className="arch-window"><div className="window-cross vertical" /><div className="window-cross horizontal" /></div>
            <div className="shelf shelf-top"><i /><b /><i /></div>
            <div className="plant plant-left"><span /><span /><span /><span /></div>
            <div className="hero-card-note">found a favorite<br />notebook <span>♥</span></div>
            <div className="desk"><div className="desk-front" /></div>
            <div className="bag"><div className="bag-handle" /><div className="bag-pocket">✦</div></div>
            <div className="book-stack"><i /><b /><em /></div>
          </div>
        </section>
        <section className="home-note"><span>✦</span><p>Every item has a story. Let’s help it continue.</p><span>✦</span></section>
      </div>
    </main>
  )
}
