import './AppShell.css'
import { useState } from 'react'
import { Sidebar } from '../../components/navigation/Sidebar'
import { AppHeader } from '../../components/header/AppHeader'

type AppShellProps = {
    title: string
    children: React.ReactNode
}

export function AppShell({ title, children }: AppShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="appShell">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
            />

            <div className="appShell__content">
                <AppHeader title={title} />
                <main className="appShell__main">{children}</main>
            </div>
        </div>
    )
}
