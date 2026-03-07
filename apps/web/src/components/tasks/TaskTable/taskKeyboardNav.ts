import type { Row } from '@tanstack/react-table'
import type { TaskRow } from './TaskTable'

export function focusNextRow(
    rows: Row<TaskRow>[],
    currentRowId: string | null
): string | null {

    if (!currentRowId) {
        return rows.length ? rows[0].id : null
    }

    const index = rows.findIndex(r => r.id === currentRowId)

    if (index === -1) return null

    const next = rows[index + 1]

    return next ? next.id : currentRowId
}

export function focusPrevRow(
    rows: Row<TaskRow>[],
    currentRowId: string | null
): string | null {

    if (!currentRowId) {
        return rows.length ? rows[0].id : null
    }

    const index = rows.findIndex(r => r.id === currentRowId)

    if (index === -1) return null

    const prev = rows[index - 1]

    return prev ? prev.id : currentRowId
}