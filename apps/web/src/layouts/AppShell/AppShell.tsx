/**
 * AppShell
 * ---------------------------------------------------------------------------
 * Top-level layout wrapper for the web app.
 * Adds a small "Quick Actions" menu under the header so actions are always
 * available without taking dashboard space.
 */
import './AppShell.css'

type AppShellProps = {
    title: string
    children: React.ReactNode
}

export function AppShell({ title, children }: AppShellProps) {
    return (
        <div className="appShell">
            <header className="appShell__header pc-card">
                <div className="appShell__headerInner pc-container">
                    <div className="appShell__brand">
                        <span className="appShell__brandName">ProjectCare</span>
                        <span className="appShell__brandTag">Internal PM Platform</span>
                    </div>

                    <div className="appShell__right">
                        <div className="appShell__pageTitle">{title}</div>

                        {/* Quick Actions: small dropdown, always accessible, not taking page real estate */}
                        <details className="quickMenu">
                            <summary className="quickMenu__summary">Quick Actions</summary>

                            <div className="quickMenu__panel pc-card">
                                <button className="quickMenu__item" type="button" disabled>
                                    New Project (coming next)
                                </button>
                                <button className="quickMenu__item" type="button" disabled>
                                    Import from Excel (MVP)
                                </button>
                                <button className="quickMenu__item" type="button" disabled>
                                    Run Report
                                </button>
                            </div>
                        </details>
                    </div>
                </div>
            </header>

            <main className="appShell__main">
                <div className="pc-container">{children}</div>
            </main>
        </div>
    )
}