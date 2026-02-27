/**
 * WhatChangedSection
 * ----------------------------------------------------------------------------
 * PURPOSE:
 * - Signal, not noise.
 * - "Since your last visit..." (delta view).
 *
 * DATA (future):
 * - Derived from AuditLogs / domain events (task status changes, due date shifts,
 *   comments, reassignments).
 */
import './WhatChangedSection.css'

type ChangeItem = {
    id: string
    label: string
    timeLabel: string
}

const stubChanges: ChangeItem[] = [
    // Keep empty for now (we don't want a noisy fake feed)
]

export function WhatChangedSection() {
    return (
        <section className="whatChanged">
            <h2 className="pc-sectionTitle">What Changed</h2>

            <div className="whatChanged__card pc-card">
                {stubChanges.length === 0 ? (
                    <div className="whatChanged__empty pc-muted">
                        No notable changes since your last visit.
                    </div>
                ) : (
                    <ul className="whatChanged__list">
                        {stubChanges.map((c) => (
                            <li key={c.id} className="whatChanged__item">
                                <div className="whatChanged__label">{c.label}</div>
                                <div className="whatChanged__time pc-muted">{c.timeLabel}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}