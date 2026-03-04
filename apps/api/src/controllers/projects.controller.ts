import { Request, Response } from 'express'
import { projectRepo } from '../repos/projectRepo'
import { taskRepo } from '../repos/taskRepo'

export function getAllProjects(_req: Request, res: Response) {
    const projects = projectRepo.getAll()
    res.json(projects)
}

export function getProjectById(req: Request, res: Response) {
    const project = projectRepo.getById(req.params.projectId)

    if (!project) {
        return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
}

export function getTasksForProject(req: Request, res: Response) {
    const tasks = taskRepo.getByProjectId(req.params.projectId)
    res.json(tasks)
}