import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects, type ProjectSummary } from '../../data/projectsApi'

export function MyProjectsPage() {
    const [projects, setProjects] = useState<ProjectSummary[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getProjects()
            .then(setProjects)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <div>Loading projects…</div>
    }

    if (projects.length === 0) {
        return <div>No projects yet.</div>
    }

    return (
        <div style={{ padding: 16 }}>
            <h2>My Projects</h2>
            <ul>
                {projects.map(p => (
                    <li key={p.id}>
                        <Link to={`/projects/${p.id}`}>{p.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
