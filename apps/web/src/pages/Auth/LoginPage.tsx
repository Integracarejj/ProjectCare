import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import './LoginPage.css'

type LocationState = {
    from?: string
}

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, status } = useAuth()

    const state = (location.state ?? {}) as LocationState
    const redirectTo = useMemo(() => {
        const from = typeof state.from === 'string' ? state.from : ''
        // Prevent redirect loops back to /login
        if (!from || from === '/login') return '/operationalhub'
        return from
    }, [state.from])

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

        const u = username.trim()
        const p = password.trim()

        // Backend returns 400 if username/password missing [1](https://integracare-my.sharepoint.com/personal/jjoyner_integracare_com/_layouts/15/Doc.aspx?sourcedoc=%7BA16746F9-9139-4091-86B1-03BE037C5BFE%7D&file=orientation%20update.docx&action=default&mobileredirect=true&DefaultItemOpen=1)
        if (!u || !p) {
            setError('Please enter both username and password.')
            return
        }

        setSubmitting(true)
        try {
            const result = await login(u, p)
            if (result.ok) {
                navigate(redirectTo, { replace: true })
            } else {
                setError(result.error || 'Login failed.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="pcLogin">
            <div className="pcLogin__card" role="region" aria-label="Sign in">
                <div className="pcLogin__header">
                    <div className="pcLogin__titleRow">
                        <span className="pcLogin__logo" aria-hidden="true">⌂</span>
                        <h1 className="pcLogin__title">ProjectCare</h1>
                    </div>
                    <p className="pcLogin__subtitle">Sign in to continue</p>
                </div>

                <form className="pcLogin__form" onSubmit={onSubmit}>
                    <label className="pcLogin__field">
                        <span className="pcLogin__label">Username</span>
                        <input
                            className="pcLogin__input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            placeholder="jeremy"
                            spellCheck={false}
                            inputMode="text"
                        />
                    </label>

                    <label className="pcLogin__field">
                        <span className="pcLogin__label">Password</span>
                        <input
                            className="pcLogin__input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            placeholder="dev-password"
                        />
                    </label>

                    {error && (
                        <div className="pcLogin__error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        className="pcLogin__submit"
                        type="submit"
                        disabled={submitting || status === 'checking'}
                    >
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </button>

                    <div className="pcLogin__hint">
                        Dev users: <code>jeremy</code>, <code>admin</code>, <code>readonly</code>, <code>exec</code> / <code>dev-password</code>
                    </div>
                </form>
            </div>
        </div>
    )
}