import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { login, signup } from '../api/auth'

export default function Auth({ onAuthenticated }) {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const isLogin = mode === 'login'

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setSuccess('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmation(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!isLogin && credentials.password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isLogin) {
        const user = await login(credentials)
        onAuthenticated(user)
        navigate('/items')
      } else {
        await signup(credentials)
        // Passwords only ever live in this form state. They are not saved after sign-up.
        setCredentials((current) => ({ ...current, password: '' }))
        setConfirmPassword('')
        setMode('login')
        setSuccess('Account created. Please log in with your new password.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-art" aria-hidden="true">
        <Link className="brand auth-brand" to="/"><span className="brand-mark">✦</span><span>Foundly</span></Link>
        <div className="auth-art-copy">
          <p className="eyebrow">Your community, connected</p>
          <h1>Good things<br /><em>find their way</em><br />back.</h1>
          <p>Sign in to lend a hand, report a lost item, and make someone’s day a little brighter.</p>
        </div>
        <div className="auth-scene"><div className="auth-window"><i /><b /></div><div className="auth-desk" /><div className="auth-plant"><i /><i /><i /><i /></div><div className="auth-lamp"><i /><b /></div><div className="auth-paper">♥</div><div className="auth-mug">✦</div></div>
      </section>
      <section className="auth-panel">
        <Link className="auth-back" to="/">← Back home</Link>
        <div className="auth-form-wrap">
          <div className="auth-tabs"><button className={isLogin ? 'active' : ''} type="button" onClick={() => switchMode('login')}>Log in</button><button className={!isLogin ? 'active' : ''} type="button" onClick={() => switchMode('signup')}>Sign up</button></div>
          <p className="eyebrow">{isLogin ? 'Welcome back' : 'Join the community'}</p>
          <h2>{isLogin ? 'Lovely to see you again.' : 'Let’s make more happy returns.'}</h2>
          <p className="auth-subtitle">{isLogin ? 'Sign in to see what’s been found.' : 'Create an account to help lost things find their people.'}</p>
          {success && <p className="form-success" role="status">{success}</p>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Username<div className="input-wrap"><span>◡</span><input value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} placeholder="Enter your username" autoComplete="username" required /></div></label>
            <label>Password<div className="input-wrap"><span>⌑</span><input type={showPassword ? 'text' : 'password'} value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} placeholder="Enter your password" autoComplete={isLogin ? 'current-password' : 'new-password'} required /><button className="password-toggle" type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
            {!isLogin && <label>Confirm password<div className="input-wrap"><span>⌑</span><input type={showConfirmation ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Type your password again" autoComplete="new-password" required /><button className="password-toggle" type="button" onClick={() => setShowConfirmation((current) => !current)} aria-label={showConfirmation ? 'Hide confirmed password' : 'Show confirmed password'} aria-pressed={showConfirmation}>{showConfirmation ? 'Hide' : 'Show'}</button></div></label>}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Just a moment…' : isLogin ? 'Log in' : 'Create account'} <span>→</span></button>
          </form>
          <p className="auth-switch">{isLogin ? 'New around here?' : 'Already have an account?'} <button type="button" onClick={() => switchMode(isLogin ? 'signup' : 'login')}>{isLogin ? 'Sign up' : 'Log in'}</button></p>
        </div>
      </section>
    </main>
  )
}
