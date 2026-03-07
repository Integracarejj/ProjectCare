import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import './ProjectsPage.css'

import { TaskTable } from '../../components/tasks/TaskTable/TaskTable'
import { taskColumns } from '../../components/tasks/TaskTable/taskColumns'
import type { TaskRow } from '../../components/tasks/TaskTable/TaskTable'
import { indentTask, outdentTask } from '../../components/tasks/TaskTable/taskIndentOutdent'
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

    // True focus anchor (separate from selection)
    const [focusedRowId, setFocusedRowId] = useState<string | null>(null)

    // Load project + tasks
    useEffect(() => {
        if (isCreateMode || !projectId) return

        setLoading(true)

        Promise.all([getProject(projectId), getProjectTasks(projectId)])
            .then(([project, tasks]) => {
                const taskRows = (tasks ?? []) as TaskRow[]

                setProjectName(project.name ?? '')
                setRows(taskRows)

                if (taskRows.length > 0) {
                    setFocusedRowId(taskRows[0].id)
                }
            })
            .finally(() => setLoading(false))
    }, [isCreateMode, projectId])

    // Ensure focused row always exists
    useEffect(() => {
        if (!focusedRowId) {
            if (rows.length > 0) setFocusedRowId(rows[0].id)
            return
        }
        const exists = rows.some(r => r.id === focusedRowId)
        if (!exists) setFocusedRowId(rows.length ? rows[0].id : null)
    }, [rows, focusedRowId])

    // Navigation helpers
    const focusNextRow = () => {
        if (!focusedRowId) return
        const currentIndex = rows.findIndex(r => r.id === focusedRowId)
        const next = rows[currentIndex + 1]
        if (next) setFocusedRowId(next.id)
    }

    const focusPrevRow = () => {
        if (!focusedRowId) return
        const currentIndex = rows.findIndex(r => r.id === focusedRowId)
        const prev = rows[currentIndex - 1]
        if (prev) setFocusedRowId(prev.id)
    }

    const tableMeta = useMemo(() => {
        return {
            indent: (taskId: string) => {
                setRows(r => indentTask(r, taskId))
                setFocusedRowId(taskId)
            },
            outdent: (taskId: string) => {
                setRows(r => outdentTask(r, taskId))
                setFocusedRowId(taskId)
            },
            getFocusedRowId: () => focusedRowId,
            setFocusedRowId: (id: string | null) => setFocusedRowId(id),
            focusNextRow,
            focusPrevRow,
        }
    }, [rows, focusedRowId])

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
                    <button className="pcIconBtn">🔔</button>
                    <button className="pcIconBtn">⬇️</button>
                    <button className="pcIconBtn">🔌</button>
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
                            {idx < VIEW_TABS.length - 1 && <span className="pcViewSeparator"></span>}
                        </div>
                    )
                })}
            </div>

            {/* Command Bar */}
            <div className="pcProjectPage__commandBar">
                <div className="pcCommandGroup">
                    <button className="pcCmdIcon">🔍</button>
                    <button className="pcCmdIcon">⌕</button>
                    <button className="pcCmdIcon">☰</button>
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
                            meta={tableMeta}
                        />
                    )
                ) : (
                    <div className="pcViewPlaceholder">{activeView} view (placeholder)</div>
                )}
            </div>
        </div>
    )
}