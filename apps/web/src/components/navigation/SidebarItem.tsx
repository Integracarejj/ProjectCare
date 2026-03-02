import './Sidebar.css'
import type { NavItem } from './useNavigation'

type SidebarItemProps = {
    item: NavItem
    isActive: boolean
    collapsed: boolean
}

export function SidebarItem({ item, isActive, collapsed }: SidebarItemProps) {
    return (
        <a
            className={[
                'pcSidebar__link',
                isActive ? 'pcSidebar__link--active' : '',
            ].join(' ')}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
        >
            <span className="pcSidebar__icon" aria-hidden="true">
                {item.icon}
            </span>
            {!collapsed && <span className="pcSidebar__label">{item.label}</span>}
        </a>
    )
}