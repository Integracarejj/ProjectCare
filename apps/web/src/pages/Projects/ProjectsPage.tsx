/**
 * ProjectsPage
 * ---------------------------------------------------------------------------
 * This is the landing page for the app.
 * In Phase 1, it will show:
 * - A list of projects
 * - Quick create project
 *
 * Later it will link to /projects/:id where the List/Board/Gantt live.
 */
import './ProjectsPage.css'

export function ProjectsPage() {
    return (
        <section className="projectsPage">
            <div className="projectsPage__header">
                <h1 className="projectsPage__title">Projects</h1>
                <p className="projectsPage__subtitle">
                    Your active projects. Click a project to open List/Board/Gantt views.
                </p>
            </div>

            <div className="projectsPage__content pc-card">
                <div className="projectsPage__empty">
                    <div className="projectsPage__emptyTitle">No projects yet</div>
                    <div className="projectsPage__emptyBody">
                        Next step: we’ll add a “Create Project” button that inserts a row in the Projects table.
                    </div>

                    <button className="projectsPage__primaryButton" type="button" disabled>
                        Create Project (coming next)
                    </button>
                </div>
            </div>
        </section>
    )
}