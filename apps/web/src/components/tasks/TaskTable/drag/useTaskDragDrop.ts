import { arrayMove } from '@dnd-kit/sortable'

export function reorderRows(rows: any[], activeId: string, overId: string) {
    const oldIndex = rows.findIndex(r => r.id === activeId)
    const newIndex = rows.findIndex(r => r.id === overId)

    if (oldIndex === -1 || newIndex === -1) return rows

    return arrayMove(rows, oldIndex, newIndex)
}