// apps/web/src/components/tasks/TaskTable/useTaskTableState.ts
import { useState } from 'react'
import type { ExpandedState, RowSelectionState, VisibilityState } from '@tanstack/react-table'

type UseTaskTableStateOptions = {
    initialExpanded?: ExpandedState
    initialRowSelection?: RowSelectionState
    initialColumnVisibility?: VisibilityState
}

/**
 * TaskTable state scaffold (controlled)
 * ---------------------------------------------------------------------------
 * Today:
 * - expanded: used for tree expand/collapse
 * - rowSelection: selection scaffolding
 * - columnVisibility: used for MVP columns vs additional columns (header control)
 */
export function useTaskTableState(options: UseTaskTableStateOptions = {}) {
    const [expanded, setExpanded] = useState<ExpandedState>(options.initialExpanded ?? {})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>(options.initialRowSelection ?? {})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        options.initialColumnVisibility ?? {}
    )

    return {
        expanded,
        setExpanded,
        rowSelection,
        setRowSelection,
        columnVisibility,
        setColumnVisibility,
    }
}