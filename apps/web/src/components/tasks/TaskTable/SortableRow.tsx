import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type SortableRowProps = {
    id: string
    className?: string
    children: React.ReactNode
}

export function SortableRow(props: SortableRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: props.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return React.createElement(
        'tr',
        {
            ref: setNodeRef,
            style,
            className: props.className,
            ...attributes,
            ...listeners,
        },
        props.children
    )
}