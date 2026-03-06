import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import type { NavItem } from './useNavigation'

type SidebarItemProps = {
    item: NavItem
    collapsed: boolean
}

export function SidebarItem({ item, collapsed }: SidebarItemProps) {
    return (
        <NavLink
            to={item.href}
            end
            className={({ isActive }) =>
                [
                    'pcSidebar__link',
                    isActive ? 'pcSidebar__link--active' : '',
                ].join(' ')
            }
            title={collapsed ? item.label : undefined}
        >
            <span className="pcSidebar__icon" aria-hidden="true">
                {getIcon(item.id)}
            </span>

            {!collapsed && (
                <span className="pcSidebar__label">{item.label}</span>
            )}
        </NavLink>
    )
}

/* --------------------------------------------------------------------------
 Icons (inline SVG — modern, consistent, dependency-free)
 -------------------------------------------------------------------------- */

function getIcon(id: string) {
    switch (id) {
        case 'ops':
            return (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12l9-9 9 9" />
                    <path d="M9 21V9h6v12" />
                </svg>
            )
        case 'portfolio':
            return (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="14" rx="2" />
                    <path d="M7 4v-1h10v1" />
                </svg>
            )
        case 'projects':
            return (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            )
        case 'reports':
            return (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" />
                    <path d="M7 15v-4" />
                    <path d="M12 15v-8" />
                    <path d="M17 15v-2" />
                </svg>
            )
        case 'templates':
            return (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M4 9h16" />
                </svg>
            )
        case 'settings':
            return (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
                </svg>
            )
        default:
            return null
    }
}