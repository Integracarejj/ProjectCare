export type NavItem = {
    id: string
    label: string
    href: string
    icon: string
}

export function useNavigation(): NavItem[] {
    // Config lives with Sidebar (not AppShell). Role-based filtering later.
    return [
        { id: 'ops', label: 'Operations Hub', href: '/operational-hub', icon: '⌂' },
        { id: 'portfolio', label: 'Portfolio', href: '/portfolio', icon: '▦' },
        { id: 'projects', label: 'My Projects', href: '/projects', icon: '🗂' },
        { id: 'reports', label: 'Reports', href: '/reports', icon: '📈' },
        { id: 'templates', label: 'Templates', href: '/templates', icon: '⬚' },
        { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙' },
    ]
}