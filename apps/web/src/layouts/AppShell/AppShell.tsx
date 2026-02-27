/**
 * AppShell
 * ---------------------------------------------------------------------------
 * This is the top-level layout wrapper for the web app.
 * It provides:
 * - A consistent header/nav area
 * - A main content area for the current page
 *
 * Later, this shell will host:
 * - Sidebar navigation
 * - The AI Copilot sidebar
 * - Global toasts/notifications
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

                    <div className="appShell__pageTitle">
                        {title}
                    </div>
                </div>
            </header>

            <main className="appShell__main">
                <div className="pc-container">
                    {children}
                </div>
            </main>
        </div>
    )
}