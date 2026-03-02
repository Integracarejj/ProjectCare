import './Sidebar.css'
import { SidebarItem } from './SidebarItem'
import { useNavigation } from './useNavigation'

type SidebarProps = {
    collapsed?: boolean
    onToggleCollapse?: () => void
    activePath?: string
}

function getPathnameSafe(): string {
    if (typeof window === 'undefined') return ''
    return window.location?.pathname ?? ''
}

export function Sidebar({
    collapsed = false,
    onToggleCollapse,
    activePath,
}: SidebarProps) {
    const items = useNavigation()
    const path = activePath ?? getPathnameSafe()

    return (
        <aside className={['pcSidebar', collapsed ? 'pcSidebar--collapsed' : ''].join(' ')}>
            <div className="pcSidebar__top">
                <a
                    className="pcSidebar__brand"
                    href="/operational-hub"
                    aria-label="ProjectCare Home"
                    title="ProjectCare Home"
                >
                    <span className="pcSidebar__brandIcon" aria-hidden="true">⌂</span>
                    {!collapsed && <span className="pcSidebar__brandText">ProjectCare</span>}
                </a>

                <button
                    type="button"
                    className="pcSidebar__collapseBtn"
                    onClick={onToggleCollapse}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? '›' : '‹'}
                </button>
            </div>

            <nav className="pcSidebar__nav" aria-label="Primary">
                {items.map((item) => (
                    <SidebarItem
                        key={item.id}
                        item={item}
                        collapsed={collapsed}
                        isActive={path === item.href}
                    />
                ))}
            </nav>
        </aside>
    )
}