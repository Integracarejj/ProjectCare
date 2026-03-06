import './Sidebar.css'
import { Link } from 'react-router-dom'
import { SidebarItem } from './SidebarItem'
import { useNavigation } from './useNavigation'

type SidebarProps = {
    collapsed?: boolean
    onToggleCollapse?: () => void
    activePath?: string
}

export function Sidebar({
    collapsed = false,
    onToggleCollapse,
}: SidebarProps) {
    const items = useNavigation()

    return (
        <aside className={['pcSidebar', collapsed ? 'pcSidebar--collapsed' : ''].join(' ')}>
            <div className="pcSidebar__top">
                <Link
                    className="pcSidebar__brand"
                    to="/operationalhub"
                    aria-label="ProjectCare Home"
                    title="ProjectCare Home"
                >
                    <span className="pcSidebar__brandIcon" aria-hidden="true">
                        ⌂
                    </span>
                    {!collapsed && <span className="pcSidebar__brandText">ProjectCare</span>}
                </Link>

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
                    />
                ))}
            </nav>
        </aside>
    )
}