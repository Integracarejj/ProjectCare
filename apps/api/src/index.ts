import express from 'express'
import cors from 'cors'
import { projectsRouter } from './routes/projects.routes'
import { authRouter } from './routes/auth.routes'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// --- Auth stub v0 (DEV ONLY) ------------------------------------
// POST /api/auth/login
app.use('/api/auth', authRouter)
// GET /api/me
app.use('/api', authRouter)

// --- Existing routes (unchanged) --------------------------------
app.use('/api/projects', projectsRouter)

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
})