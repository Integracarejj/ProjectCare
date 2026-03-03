import { useEffect, useRef, useState } from 'react'
import './QuickActions.css'

type QuickActionItem = {
    id: string
    label: string
    icon: React.ReactNode
    onClick?: () => void
}

function IconPlus() {
    return (
        <svg className="qa__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}

function IconNotebook() {
    return (
        <svg className="qa__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M7 4h10a2 2 0 0 1 2 2v14a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path d="M9 8h8M9 12h8M9 16h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6.5 4.5v16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}

function IconStatus() {
    return (
        <svg className="qa__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 19V5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 19h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 16v-6M12 16v-9M16 16v-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}

function IconRaid() {
    return (
        <svg className="qa__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M12 3l9 16H3l9-16z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path d="M12 9v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 17h.01" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    )
}

export function QuickActions() {
    const [open, setOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement | null>(null)
    const triggerRef = useRef<HTMLButtonElement | null>(null)

    const items: QuickActionItem[] = [
        { id: 'create-project', label: 'Create Project', icon: <IconPlus /> },
        { id: 'project-notebook', label: 'Project Notebook', icon: <IconNotebook /> },
        { id: 'generate-status', label: 'Generate Status Update', icon: <IconStatus /> },
        { id: 'raid-log', label: 'RAID Log', icon: <IconRaid /> },
    ]

    // Click-off to close (anywhere outside the menu)
    useEffect(() => {
        if (!open) return

        function onPointerDown(e: MouseEvent | PointerEvent) {
            const root = rootRef.current
            if (!root) return

            const target = e.target as Node | null
            if (target && root.contains(target)) return

            setOpen(false)
        }

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setOpen(false)
                // return focus to the trigger for accessibility
                triggerRef.current?.focus()
            }
        }

        // Use capture so we close even if other handlers stopPropagation
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown)

        return () => {
            document.removeEventListener('pointerdown', onPointerDown, true)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    function toggle() {
        setOpen(v => !v)
    }

    return (
        <div ref={rootRef} className="qa" aria-label="Quick actions">
            <button
                ref={triggerRef}
                className="qa__trigger"
                type="button"
                aria-haspopup="menu"
                aria-expanded={open ? 'true' : 'false'}
                onClick={toggle}
            >
                Quick Actions
                <svg className="qa__chev" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {open && (
                <div className="qa__menu" role="menu">
                    {items.map(item => (
                        <button
                            key={item.id}
                            className="qa__item"
                            type="button"
                            role="menuitem"
                            // Intentionally not wired yet. If you want a click to close the menu for now, keep this:
                            onClick={() => {
                                setOpen(false)
                                // later: route / open modal
                                item.onClick?.()
                            }}
                        >
                            <span className="qa__itemIcon" aria-hidden="true">
                                {item.icon}
                            </span>
                            <span className="qa__itemLabel">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}