import { Link } from 'react-router-dom'

export default function AccessDenied() {
  return (
    <main className="feedback-page">
      <section className="feedback-card">
        <p className="eyebrow">403 · Access restricted</p>
        <h1>This space is for admins.</h1>
        <p>Your account does not have permission to view the admin dashboard. You can continue browsing community reports.</p>
        <Link className="primary-button" to="/items">Back to items <span>→</span></Link>
      </section>
    </main>
  )
}
