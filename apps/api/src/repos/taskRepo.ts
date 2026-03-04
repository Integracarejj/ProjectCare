import fs from 'fs'
import path from 'path'

const filePath = path.join(__dirname, '../db/seed/tasks.json')

export type Task = {
    id: string
    projectId: string
    parentId: string | null
    title: string
    status: string
    order: number
    createdAt: string
}

function read(): Task[] {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export const taskRepo = {
    getByProjectId(projectId: string) {
        return read()
            .filter(t => t.projectId === projectId)
            .sort((a, b) => a.order - b.order)
    },
}