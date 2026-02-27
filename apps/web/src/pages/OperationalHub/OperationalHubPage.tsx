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
import { YourFocusSection } from './sections/YourFocus/YourFocusSection'
import { WhatChangedSection } from './sections/WhatChanged/WhatChangedSection'
import { QuickActionsSection } from './sections/QuickActions/QuickActionsSection'

export function OperationalHubPage() {
    // "Today indicator" makes the page feel alive (per your attachment).
    // In the real app, counts will come from API. For now: stub data.
    const todayLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })

    // Stub "summary counts" for the top row cards.
    // Replace later with API calls that compute these from DB.
    const summary = {
        needsAttention: 0,  // overdue + blocked items
        dueThisWeek: 0,     // due in next 7 days (high priority later)
        atRiskProjects: 0,  // RAG yellow/red
        overallHealthPct: 100, // placeholder
    }

    return (
        <div className="hub">
            <div className="hub__topNote pc-muted">
                <strong>Today:</strong> {todayLabel} — {summary.needsAttention} items need attention
            </div>

            <div className="hub__grid">
                {/* Full-width top row: 4 calm "Immediate State" cards */}
                <div className="hub__rowFull">
                    <ImmediateStateSection summary={summary} />
                </div>

                {/* Left (main): Your Focus takes most vertical space */}
                <div className="hub__main">
                    <YourFocusSection />
                </div>

                {/* Right rail: signal + actions */}
                <aside className="hub__rail">
                    <WhatChangedSection />
                    <QuickActionsSection />
                </aside>
            </div>
        </div>
    )
}