import fs from 'fs'
import path from 'path'

const filePath = path.join(__dirname, '../db/seed/projects.json')

export type Project = {
    id: string
    name: string
    createdAt: string
}

function read(): Project[] {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export const projectRepo = {
    getAll(): Project[] {
        return read()
    },

    getById(id: string): Project | undefined {
        return read().find(p => p.id === id)
    },
}