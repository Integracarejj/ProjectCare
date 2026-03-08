import React from 'react'
import { SortableRowContext } from './SortableRow'

export function DragHandle() {
    const ctx = React.useContext(SortableRowContext)
    if (!ctx) return null

    return (
        <span
            ref={ctx.setActivatorNodeRef}
            {...ctx.attributes}
            {...ctx.listeners}
            className="dragHandle"
            aria-label="Drag row"
            title="Drag row"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            ☰
        </span>
    )
}