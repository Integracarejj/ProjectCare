import { useSortable } from '@dnd-kit/sortable'

export function DragHandle({ id }: { id: string }) {
    const { attributes, listeners } = useSortable({ id })

    return (
        <span className="pcDragHandle" {...attributes} {...listeners}>
            ⋮⋮
        </span>
    )
}