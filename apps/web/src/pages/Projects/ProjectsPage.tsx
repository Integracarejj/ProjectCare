import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './ProjectsPage.css'

import { TaskTable } from '../../components/tasks/TaskTable/TaskTable'
import { taskColumns, type TaskRow } from '../../components/tasks/TaskTable/taskColumns'
import { getProject, getProjectTasks } from '../../data/projectsApi'

type ViewKey = 'list' | 'board' | 'dashboard' | 'gantt'

const VIEW_TABS: Array<{ key: ViewKey; label: string; icon: string }> = [
    { key: 'list', label: 'List', icon: '📋' },
    { key: 'board', label: 'Board', icon: '🗂️' },
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'gantt', label: 'Gantt', icon: '📅' },
]

export function ProjectsPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const isCreateMode = !projectId

    const [activeView, setActiveView] = useState<ViewKey>('list')
    const [projectName, setProjectName] = useState('')
    const [rows, setRows] = useState<TaskRow[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isCreateMode || !projectId) return

        setLoading(true)

        Promise.all([getProject(projectId), getProjectTasks(projectId)])
            .then(([project, tasks]) => {
                setProjectName(project.name ?? '')
                setRows(tasks ?? [])
            })
            .catch(() => {
                // Intentionally quiet for now to avoid noisy UX in early build.
                // (We can add a premium inline error state later.)
            })
            .finally(() => setLoading(false))
    }, [isCreateMode, projectId])

    return (
        <div className="pcProjectPage">
            {/* Top Row */}
            <div className="pcProjectPage__topRow">
                <input
                    className="pcProjectPage__titleInput"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder={isCreateMode ? 'New Project Name' : 'Project Name'}
                />

                <div className="pcProjectPage__health">
                    <div className="pcHealthLabel">Project Health</div>
                    <div className="pcHealthValue">—</div>
                </div>

                <div className="pcProjectPage__actions">
                    <button className="pcIconBtn" aria-label="Notifications">
                        🔔
                    </button>
                    <button className="pcIconBtn" aria-label="Export">
                        ⬇️
                    </button>
                    <button className="pcIconBtn" aria-label="Integrations">
                        🔌
                    </button>
                </div>
            </div>

            {/* View Selector */}
            <div className="pcProjectPage__views">
                {VIEW_TABS.map((v, idx) => {
                    const isActive = v.key === activeView
                    return (
                        <div key={v.key} className="pcViewTabWrapper">
                            <button
                                className={`pcViewTab ${isActive ? 'is-active' : ''}`}
                                onClick={() => setActiveView(v.key)}
                            >
                                {v.icon} {v.label}
                            </button>
                            {idx < VIEW_TABS.length - 1 && (
                                <span className="pcViewSeparator">|</span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Formatting / Command Ribbon (restored: icon-first + "+ Column" only) */}
            <div className="pcProjectPage__commandBar">
                <div className="pcCommandGroup">
                    <button className="pcCmdIcon" aria-label="Search">
                        🔍
                    </button>
                    <button className="pcCmdIcon" aria-label="Filter">
                        ⌕
                    </button>
                    <button className="pcCmdIcon" aria-label="View options">
                        ☰
                    </button>
                </div>

                <div className="pcCommandGroup pcCommandGroup--right">
                    <button className="pcCmdBtn">+ Column</button>
                </div>
            </div>

            {/* Work Surface */}
            <div className="pcProjectPage__surface">
                {activeView === 'list' ? (
                    loading ? (
                        <div className="pcViewPlaceholder">Loading tasks…</div>
                    ) : (
                        <TaskTable
                            rows={rows}
                            columns={taskColumns}
                            ariaLabel="Project tasks list"
                        />
                    )
                ) : (
                    <div className="pcViewPlaceholder">{activeView} view (placeholder)</div>
                )}
            </div>
        </div>
    )
}