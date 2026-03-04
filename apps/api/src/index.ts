import express from 'express'
import cors from 'cors'
import { projectsRouter } from './routes/projects.routes'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api/projects', projectsRouter)

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
})
