/**
 * MyProjectsSection
 * ----------------------------------------------------------------------------
 * PURPOSE:
 * - Make it extremely obvious how to get to projects.
 * - Right-rail "launchpad": quick access to projects the user owns or follows.
 *
 * DATA (future):
 * - Projects where current user is PM/owner
 * - (Optional) Projects recently visited
 * - (Optional) Favorite/pinned projects
 */
import './MyProjectsSection.css'

export type MyProject = {
    id: string
    name: string
    rag: 'Green' | 'Yellow' | 'Red'
    note: string
}

export function MyProjectsSection({ projects }: { projects: MyProject[] }) {
    return (
        <section className="myProjects">
            <div className="myProjects__header">
                <h2 className="pc-sectionTitle">My Projects</h2>
                <div className="pc-muted">Fast access to what you manage</div>
            </div>

            <div className="myProjects__card pc-card">
                {projects.length === 0 ? (
                    <div className="pc-muted">No projects yet.</div>
                ) : (
                    <ul className="myProjects__list">
                        {projects.map((p) => (
                            <li key={p.id} className="myProjects__item">
                                <div className="myProjects__left">
                                    <div className="myProjects__name">{p.name}</div>
                                    <div className="myProjects__note pc-muted">{p.note}</div>
                                </div>

                                <span className={`myProjects__rag myProjects__rag--${p.rag}`}>
                                    {p.rag}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                <button className="myProjects__viewAll" type="button" disabled>
                    View all projects (coming soon)
                </button>
            </div>
        </section>
    )
}