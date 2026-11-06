import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="feedback-page">
      <section className="feedback-card">
        <p className="eyebrow">404 · Page not found</p>
        <h1>That page wandered off.</h1>
        <p>We could not find the page you requested. Check the URL or return to the community noticeboard.</p>
        <Link className="primary-button" to="/">Back home <span>→</span></Link>
      </section>
    </main>
  )
}
