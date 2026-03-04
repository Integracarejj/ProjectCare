import { Router } from 'express'
import {
    getAllProjects,
    getProjectById,
    getTasksForProject,
} from '../controllers/projects.controller'

export const projectsRouter = Router()

projectsRouter.get('/', getAllProjects)
projectsRouter.get('/:projectId', getProjectById)
projectsRouter.get('/:projectId/tasks', getTasksForProject)
