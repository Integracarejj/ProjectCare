import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type AuthUser = {
    id: string
    username: string
    displayName: string
    email?: string
    isActive: boolean
}

type MeResponse = {
    user: AuthUser
    roles: string[]
}

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
    status: AuthStatus
    isAuthenticated: boolean
    token: string | null
    user: AuthUser | null
    roles: string[]
    login: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ✅ No-proxy required default.
// Optionally set VITE_API_BASE_URL=http://localhost:3001
const API_BASE =
    (import.meta as any).env?.VITE_API_BASE_URL?.toString()?.trim() ||
    'http://localhost:3001'

const TOKEN_KEY = 'pc_token'
const LEGACY_TOKEN_KEYS = ['token', 'auth_token', 'projectcare_token'] as const

function readStoredToken(): { token: string | null; keyUsed: string | null } {
    const primary = localStorage.getItem(TOKEN_KEY)
    if (primary) return { token: primary, keyUsed: TOKEN_KEY }

    for (const k of LEGACY_TOKEN_KEYS) {
        const t = localStorage.getItem(k)
        if (t) return { token: t, keyUsed: k }
    }

    return { token: null, keyUsed: null }
}

function writeStoredToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
}

function clearStoredToken() {
    localStorage.removeItem(TOKEN_KEY)
    for (const k of LEGACY_TOKEN_KEYS) localStorage.removeItem(k)
}

async function fetchMe(token: string): Promise<MeResponse> {
    // Backend: GET /api/me expects Authorization: Bearer <token> [1](https://integracare-my.sharepoint.com/personal/jjoyner_integracare_com/_layouts/15/Doc.aspx?sourcedoc=%7BA16746F9-9139-4091-86B1-03BE037C5BFE%7D&file=orientation%20update.docx&action=default&mobileredirect=true&DefaultItemOpen=1)
    const res = await fetch(`${API_BASE}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        const msg = await res.text().catch(() => '')
        throw new Error(msg || `ME request failed (${res.status})`)
    }

    return (await res.json()) as MeResponse
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('checking')
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<AuthUser | null>(null)
    const [roles, setRoles] = useState<string[]>([])

    useEffect(() => {
        let cancelled = false

        async function hydrate() {
            setStatus('checking')

            const stored = readStoredToken()
            if (!stored.token) {
                if (!cancelled) {
                    setToken(null)
                    setUser(null)
                    setRoles([])
                    setStatus('unauthenticated')
                }
                return
            }

            // Optimistically keep token so we don't bounce during /me validation
            if (!cancelled) setToken(stored.token)

            try {
                const me = await fetchMe(stored.token)
                if (cancelled) return
                setUser(me.user)
                setRoles(me.roles ?? [])
                setStatus('authenticated')
                writeStoredToken(stored.token) // normalize storage key
            } catch {
                if (cancelled) return
                clearStoredToken()
                setToken(null)
                setUser(null)
                setRoles([])
                setStatus('unauthenticated')
            }
        }

        hydrate()
        return () => {
            cancelled = true
        }
    }, [])

    async function login(username: string, password: string) {
        // Backend: POST /api/auth/login returns { token } [1](https://integracare-my.sharepoint.com/personal/jjoyner_integracare_com/_layouts/15/Doc.aspx?sourcedoc=%7BA16746F9-9139-4091-86B1-03BE037C5BFE%7D&file=orientation%20update.docx&action=default&mobileredirect=true&DefaultItemOpen=1)
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })

        if (!res.ok) {
            const data = (await res.json().catch(() => null)) as any
            return { ok: false as const, error: data?.error ?? 'Login failed' }
        }

        const data = (await res.json()) as { token: string }
        const t = data?.token
        if (!t) return { ok: false as const, error: 'Missing token from server' }

        writeStoredToken(t)
        setToken(t)
        setStatus('checking')

        try {
            const me = await fetchMe(t)
            setUser(me.user)
            setRoles(me.roles ?? [])
            setStatus('authenticated')
            return { ok: true as const }
        } catch {
            clearStoredToken()
            setToken(null)
            setUser(null)
            setRoles([])
            setStatus('unauthenticated')
            return { ok: false as const, error: 'Session validation failed' }
        }
    }

    function logout() {
        clearStoredToken()
        setToken(null)
        setUser(null)
        setRoles([])
        setStatus('unauthenticated')
    }

    const value = useMemo<AuthContextValue>(
        () => ({
            status,
            isAuthenticated: status === 'authenticated',
            token,
            user,
            roles,
            login,
            logout,
        }),
        [status, token, user, roles]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
