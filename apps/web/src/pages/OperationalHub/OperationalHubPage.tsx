/**
 * OperationalHubPage (PM-first)
 * ----------------------------------------------------------------------------
 * PURPOSE:
 * - Calm operational control center (not a marketing page).
 * - Answers in 10 seconds: what needs attention, what to focus on, what changed,
 *   and what quick actions are available.
 *
 * PERSONA NOTE:
 * - This is PM-first (Operational Hub).
 * - Later: Exec view swaps "Your Focus" for portfolio rollups, using the same layout.
 *
 * DATA NOTE (future):
 * - Top cards: derived from tasks/projects tables (overdue/blocked/risk/health).
 * - Your Focus: tasks assigned to user, grouped by project, sorted by urgency.
 * - What Changed: activity stream since last visit (audit/events).
 */
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

    // Sample data (transitional — API later)
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

    const needsAttention =
        focusTasks.filter(t => t.status === 'Blocked' || t.dueLabel.startsWith('Overdue')).length

    const dueThisWeek =
        focusTasks.filter(t => ['Tomorrow', 'Fri'].includes(t.dueLabel)).length

    const atRiskProjects = projects.filter(p => p.rag !== 'Green').length

    const overallHealthPct = Math.round(
        (projects.filter(p => p.rag === 'Green').length / projects.length) * 100
    )

    const summary = { needsAttention, dueThisWeek, atRiskProjects, overallHealthPct }

    return (
        <div className="hub">
            <div className="pc-container hub__surface">
                <div className="hub__topNote pc-muted">
                    <strong>Today:</strong> {todayLabel} — {summary.needsAttention} items need attention
                </div>

                <div className="hub__grid">
                    <div className="hub__rowFull">
                        <ImmediateStateSection summary={summary} />
                    </div>

                    <div className="hub__main">
                        <YourFocusSection tasks={focusTasks} />
                    </div>

                    <aside className="hub__rail">
                        <MyProjectsSection projects={projects} />
                    </aside>
                </div>
            </div>
        </div>
    )


}