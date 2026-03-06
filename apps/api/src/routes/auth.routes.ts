// apps/api/src/routes/auth.routes.ts
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'

type AuthSeed = {
    users: Array<{
        id: string
        username: string
        password: string
        displayName: string
        email?: string
        isActive: boolean
    }>
    roles: Array<{ id: string; name: string }>
    userRoles: Array<{ id: string; userId: string; roleId: string }>
}

function readAuthSeed(): AuthSeed {
    const filePath = path.resolve(process.cwd(), 'src', 'db', 'seed', 'auth.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw) as AuthSeed
}

function safeUser(user: AuthSeed['users'][number]) {
    // Do not leak password to clients
    const { password: _pw, ...rest } = user
    return rest
}

function parseBearer(authHeader: unknown): string | null {
    if (typeof authHeader !== 'string') return null
    const trimmed = authHeader.trim()
    if (!trimmed.toLowerCase().startsWith('bearer ')) return null
    const token = trimmed.slice(7).trim()
    return token.length ? token : null
}

export const authRouter = Router()

/**
 * DEV-ONLY AUTH STUB
 * ---------------------------------------------------------------------------
 * This is scaffolding for later Entra/OIDC integration.
 * - Passwords are stored in plaintext ONLY because this is dev-only stub.
 * - Token is NOT a real JWT: token is just the userId for now.
 * - Do not ship to production.
 */

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
    const { username, password } = (req.body ?? {}) as {
        username?: string
        password?: string
    }

    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' })
    }

    const seed = readAuthSeed()
    const user = seed.users.find(
        u => u.isActive && u.username.toLowerCase() === String(username).toLowerCase()
    )

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'invalid credentials' })
    }

    // Token is just userId for now (dev stub)
    return res.json({ token: user.id })
})

// GET /api/me
authRouter.get('/me', (req, res) => {
    const token = parseBearer(req.headers.authorization)
    if (!token) {
        return res.status(401).json({ error: 'missing bearer token' })
    }

    const seed = readAuthSeed()
    const user = seed.users.find(u => u.isActive && u.id === token)

    if (!user) {
        return res.status(401).json({ error: 'invalid token' })
    }

    const roleIds = seed.userRoles.filter(ur => ur.userId === user.id).map(ur => ur.roleId)
    const roles = seed.roles.filter(r => roleIds.includes(r.id)).map(r => r.name)

    return res.json({
        user: safeUser(user),
        roles,
    })
})