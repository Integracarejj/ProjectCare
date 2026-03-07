import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Props = {
    id: string
}

export function DragHandle(props: Props) {

    const sortable = useSortable({ id: props.id })

    const style = {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        cursor: "grab"
    }

    return React.createElement(
        "span",
        {
            ref: sortable.setActivatorNodeRef,
            ...sortable.attributes,
            ...sortable.listeners,
            style,
            className: "dragHandle"
        },
        "☰"
    )
}