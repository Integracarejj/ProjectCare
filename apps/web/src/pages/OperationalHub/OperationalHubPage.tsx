import './OperationalHubPage.css'

import { ImmediateStateSection } from './sections/ImmediateState/ImmediateStateSection'
import { YourFocusSection, type FocusTask } from './sections/YourFocus/YourFocusSection'
import { MyProjectsSection, type MyProject } from './sections/MyProjects/MyProjectsSection'

export function OperationalHubPage() {
    const todayLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })

    const projects: MyProject[] = [
        { id: 'p1', name: 'RePlatform (WelcomeHome)', rag: 'Yellow', note: '2 overdue tasks • next milestone in 8 days' },
        { id: 'p2', name: 'Ops Tools 101', rag: 'Green', note: 'On track • 0 blockers' },
        { id: 'p3', name: 'Budget Portal MVP', rag: 'Red', note: 'Blocked dependency • needs decision' },
    ]

    const focusTasks: FocusTask[] = [
        { id: 't1', projectName: 'RePlatform (WelcomeHome)', title: 'Confirm data migration field mapping', dueLabel: 'Overdue (2d)', status: 'Blocked' },
        { id: 't2', projectName: 'RePlatform (WelcomeHome)', title: 'Draft pilot wave communication to communities', dueLabel: 'Tomorrow', status: 'In Progress' },
        { id: 't3', projectName: 'Budget Portal MVP', title: 'Finalize KPI definitions for dashboard', dueLabel: 'Fri', status: 'Not Started' },
        { id: 't4', projectName: 'Ops Tools 101', title: 'Review training checklist and publish', dueLabel: 'Next week', status: 'Not Started' },
    ]

    const summary = {
        needsAttention: focusTasks.filter(
            t => t.status === 'Blocked' || t.dueLabel.startsWith('Overdue')
        ).length,
        dueThisWeek: focusTasks.filter(t =>
            ['Tomorrow', 'Fri'].includes(t.dueLabel)
        ).length,
        atRiskProjects: projects.filter(p => p.rag !== 'Green').length,
        overallHealthPct: Math.round(
            (projects.filter(p => p.rag === 'Green').length / projects.length) * 100
        ),
    }

    return (
        <div className="hub">
            <section className="hub__surface">
                <div className="hub__headerRow">
                    <p className="hub__topNote">
                        Today: <strong>{todayLabel}</strong> — {summary.needsAttention} items need attention
                    </p>
                </div>

                <div className="hub__grid">
                    <div className="hub__rowFull">
                        <ImmediateStateSection summary={summary} />
                    </div>

                    <div className="hub__bottomGrid">
                        <YourFocusSection tasks={focusTasks} />
                        <MyProjectsSection projects={projects} />
                    </div>
                </div>
            </section>
        </div>
    )
}