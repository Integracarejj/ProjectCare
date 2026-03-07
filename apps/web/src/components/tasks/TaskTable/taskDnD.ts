import { arrayMove } from "@dnd-kit/sortable"
import type { TaskRow } from './TaskTable'

export function reorderTasks(
    tasks: TaskRow[],
    activeId: string,
    overId: string
): TaskRow[] {

    const oldIndex = tasks.findIndex(t => t.id === activeId)
    const newIndex = tasks.findIndex(t => t.id === overId)

    if (oldIndex === -1 || newIndex === -1) {
        return tasks
    }

    const reordered = arrayMove(tasks, oldIndex, newIndex)

    return reordered.map((t, i) => ({
        ...t,
        order: i
    }))
}