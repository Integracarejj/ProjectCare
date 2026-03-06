// apps/web/src/components/tasks/TaskTable/useTaskTableState.ts
import { useState } from 'react'
import type { ExpandedState, RowSelectionState } from '@tanstack/react-table'

type UseTaskTableStateOptions = {
    initialExpanded?: ExpandedState
    initialRowSelection?: RowSelectionState
}

/**
 * TaskTable state scaffold (controlled)
 * ---------------------------------------------------------------------------
 * Today:
 * - expanded: used for tree expand/collapse
 *
 * Scaffolded (not used by UI yet, but wired for TanStack):
 * - rowSelection: enables easy future row selection features without refactors
 */
export function useTaskTableState(options: UseTaskTableStateOptions = {}) {
    const [expanded, setExpanded] = useState<ExpandedState>(options.initialExpanded ?? {})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>(
        options.initialRowSelection ?? {}
    )

    return {
        expanded,
        setExpanded,
        rowSelection,
        setRowSelection,
    }
}