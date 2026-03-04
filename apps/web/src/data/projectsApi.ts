import type { TaskRow } from '../components/tasks/TaskTable/taskColumns'

const API_BASE = 'http://localhost:3001/api'

export type ProjectSummary = {
    id: string
    name: string
    createdAt: string
}

export async function getProjects(): Promise<ProjectSummary[]> {
    const res = await fetch(`${API_BASE}/projects`)
    if (!res.ok) throw new Error('Failed to load projects')
    return res.json()
}

export async function getProject(projectId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`)
    if (!res.ok) throw new Error('Failed to load project')
    return res.json()
}

export async function getProjectTasks(
    projectId: string
): Promise<TaskRow[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`)
    if (!res.ok) throw new Error('Failed to load tasks')
    return res.json()
}