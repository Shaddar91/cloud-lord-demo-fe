import { useState, type FormEvent } from 'react'
import { login } from './api/client'

export default function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await login({ username, password })
      //JWT path: keep any returned token so later calls can send Authorization:
      //Bearer <token>. Cookie path: nothing to store, credentials:'include' does it.
      if (res.token) setToken(res.token)
      setLoggedInUser(res.user ?? username)
    } catch (err) {
      const apiErr = err as { message?: string }
      setError(apiErr.message ?? 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loggedInUser) {
    return (
      <main className="card">
        <h1>Cloud-Lord Demo</h1>
        <p data-testid="logged-in">Logged in as {loggedInUser}</p>
        {token && <p className="hint">Session token stored.</p>}
      </main>
    )
  }

  return (
    <main className="card">
      <h1>Cloud-Lord Demo</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Log in'}
        </button>
      </form>
      {error && (
        <p data-testid="login-error" className="error">
          {error}
        </p>
      )}
    </main>
  )
}
