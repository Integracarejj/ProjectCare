/**
 * ImmediateStateSection
 * ----------------------------------------------------------------------------
 * PURPOSE:
 * - At-a-glance operational health (4 calm cards max).
 * - Each card is clickable later (filters, reports, drilldowns).
 *
 * Cards (PM view):
 * - Needs Attention: overdue + blocked items (anxiety reducer)
 * - Due This Week: near-term focus anchor
 * - At Risk Projects: RAG yellow/red (exec-friendly too)
 * - Overall Health: big picture indicator
 */
import './ImmediateStateSection.css'

type Summary = {
    needsAttention: number
    dueThisWeek: number
    atRiskProjects: number
    overallHealthPct: number
}

export function ImmediateStateSection({ summary }: { summary: Summary }) {
    return (
        <section className="immediateState">
            <h2 className="pc-sectionTitle">Immediate State</h2>

            <div className="immediateState__grid">
                <div className="immediateState__card pc-card">
                    <div className="immediateState__label">Needs Attention</div>
                    <div className="immediateState__value">{summary.needsAttention}</div>
                    <div className="immediateState__hint pc-muted">Overdue + blocked items</div>
                </div>

                <div className="immediateState__card pc-card">
                    <div className="immediateState__label">Due This Week</div>
                    <div className="immediateState__value">{summary.dueThisWeek}</div>
                    <div className="immediateState__hint pc-muted">Next 7 days</div>
                </div>

                <div className="immediateState__card pc-card">
                    <div className="immediateState__label">At Risk Projects</div>
                    <div className="immediateState__value">{summary.atRiskProjects}</div>
                    <div className="immediateState__hint pc-muted">RAG: Yellow/Red</div>
                </div>

                <div className="immediateState__card pc-card">
                    <div className="immediateState__label">Overall Health</div>
                    <div className="immediateState__value">{summary.overallHealthPct}%</div>
                    <div className="immediateState__hint pc-muted">On-track indicator</div>
                </div>
            </div>
        </section>
    )
}