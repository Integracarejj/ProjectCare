/**
 * YourFocusSection (Most Important)
 * ----------------------------------------------------------------------------
 * PURPOSE:
 * - Emotional anchor of the hub (reduces decision fatigue).
 * - Shows what the PM should work on next.
 *
 * DATA (future):
 * - Tasks assigned to current user (and/or tasks for projects they own).
 * - Grouped by project.
 * - Sorted: overdue -> blocked -> high priority -> due soon.
 */
import './YourFocusSection.css'

type FocusTask = {
    id: string
    projectName: string
    title: string
    dueLabel: string
    status: 'Not Started' | 'In Progress' | 'Blocked' | 'Complete'
}

// Stub tasks so the layout feels real without inventing product logic.
const stubTasks: FocusTask[] = [
    // Intentionally empty to keep it calm at first.
    // Add a few sample tasks later if you want to see density.
]

export function YourFocusSection() {
    const grouped = groupByProject(stubTasks)

    return (
        <section className="yourFocus">
            <div className="yourFocus__header">
                <h2 className="pc-sectionTitle">Your Focus</h2>
                <div className="pc-muted">What you should work on next (grouped by project)</div>
            </div>

            <div className="yourFocus__card pc-card">
                {Object.keys(grouped).length === 0 ? (
                    <div className="yourFocus__empty">
                        <div className="yourFocus__emptyTitle">Nothing urgent yet</div>
                        <div className="pc-muted">
                            Once tasks exist, this section becomes your daily “work queue.”
                        </div>
                    </div>
                ) : (
                    <div className="yourFocus__groups">
                        {Object.entries(grouped).map(([projectName, tasks]) => (
                            <div key={projectName} className="yourFocus__group">
                                <div className="yourFocus__groupTitle">{projectName}</div>

                                <ul className="yourFocus__list">
                                    {tasks.map((t) => (
                                        <li key={t.id} className="yourFocus__item">
                                            <div className="yourFocus__itemMain">
                                                <div className="yourFocus__itemTitle">{t.title}</div>
                                                <div className="yourFocus__itemMeta pc-muted">
                                                    Due: {t.dueLabel} • Status: {t.status}
                                                </div>
                                            </div>

                                            {/* later: quick actions (complete/comment) */}
                                            <button className="yourFocus__itemBtn" type="button" disabled>
                                                Open
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

function groupByProject(tasks: FocusTask[]) {
    return tasks.reduce<Record<string, FocusTask[]>>((acc, t) => {
        acc[t.projectName] = acc[t.projectName] ?? []
        acc[t.projectName].push(t)
        return acc
    }, {})
}