/**
 * QuickActionsSection
 * ----------------------------------------------------------------------------
 * PURPOSE:
 * - Reduce friction. Make the hub feel alive.
 * - These actions will later route to flows (create project, import Excel, reports).
 */
import './QuickActionsSection.css'

export function QuickActionsSection() {
    return (
        <section className="quickActions">
            <h2 className="pc-sectionTitle">Quick Actions</h2>

            <div className="quickActions__card pc-card">
                <button className="quickActions__btn" type="button" disabled>
                    New Project (coming next)
                </button>
                <button className="quickActions__btn" type="button" disabled>
                    Import from Excel (MVP)
                </button>
                <button className="quickActions__btn" type="button" disabled>
                    Run Report
                </button>
                <button className="quickActions__btn" type="button" disabled>
                    View Portfolio (Phase 2)
                </button>

                <div className="quickActions__hint pc-muted">
                    These become real once routing + API are in place.
                </div>
            </div>
        </section>
    )
}