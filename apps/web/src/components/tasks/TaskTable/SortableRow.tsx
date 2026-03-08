import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type SortableCtx = {
    attributes: any
    listeners: any
    setActivatorNodeRef: (node: HTMLElement | null) => void
}

export const SortableRowContext = React.createContext<SortableCtx | null>(null)

type SortableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
    id: string
    className?: string
    children: React.ReactNode
}

export function SortableRow(props: SortableRowProps) {
    const { id, className, children, ...rest } = props

    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
    } = useSortable({ id })

    const style = {
        ...(rest.style ?? {}),
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <SortableRowContext.Provider value={{ attributes, listeners, setActivatorNodeRef }}>
            <tr ref={setNodeRef} className={className} {...rest} style={style}>
                {children}
            </tr>
        </SortableRowContext.Provider>
    )
}