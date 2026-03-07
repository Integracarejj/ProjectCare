import type { TaskRow } from './TaskTable'

export type FocusState = {
    focusedRowId: string | null
}

export function toggleRowFocus(
    state: FocusState,
    rowId: string
): FocusState {
    if (state.focusedRowId === rowId) {
        return { focusedRowId: null }
    }

    return { focusedRowId: rowId }
}

export function clearFocus(): FocusState {
    return { focusedRowId: null }
}

export function setFocus(rowId: string): FocusState {
    return { focusedRowId: rowId }
}

export function isRowFocused(
    state: FocusState,
    rowId: string
): boolean {
    return state.focusedRowId === rowId
}