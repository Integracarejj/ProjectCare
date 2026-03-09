import { useLayoutEffect, useRef } from 'react'
import type { Table } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import './TaskTableViewport.css'
import { SortableRow } from './SortableRow'

type Props<TData extends { id: string }> = {
    table: Table<TData>
    ariaLabel: string
    // Row-level class computation stays outside (so DnD/selection/focus logic remains in TaskTable.tsx)
    getRowClassName: (row: any) => string
    // Used to set a stable data-row-id hook (focus alignment)
    getRowId: (row: any) => string
}

export function TaskTableViewport<TData extends { id: string }>({
    table,
    ariaLabel,
    getRowClassName,
    getRowId,
}: Props<TData>) {
    const viewportRef = useRef<HTMLDivElement | null>(null)

    // Ensure the viewport exposes horizontal scrollbar when needed
    // (No hiding. No “fixed bar” hacks.)
    useLayoutEffect(() => {
        // If you want, we can later add a subtle fade indicator when overflow exists.
        // For now: keep it deterministic and simple.
    }, [])

    return (
        <div className="pcTaskViewport" ref={viewportRef}>
            <div className="pcTaskViewport__scroll">
                <table className="pcTaskTable" aria-label={ariaLabel}>
                    <thead className="pcTaskTable__thead">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="pcTaskTable__headRow">
                                {headerGroup.headers.map(header => {
                                    const meta: any = header.column.columnDef.meta
                                    const thMetaClass = meta?.thClassName ? String(meta.thClassName) : ''
                                    const thClassName = ['pcTaskTable__th', thMetaClass].filter(Boolean).join(' ')

                                    return (
                                        <th key={header.id} className={thClassName}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td className="pcTaskTable__td" colSpan={table.getAllColumns().length}>
                                    No tasks yet.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => {
                                const rowClassName = getRowClassName(row)
                                const rid = getRowId(row)

                                return (
                                    <SortableRow key={row.id} id={rid} data-row-id={rid} className={rowClassName}>
                                        {row.getVisibleCells().map(cell => {
                                            const meta: any = cell.column.columnDef.meta
                                            const tdMetaClass = meta?.tdClassName ? String(meta.tdClassName) : ''
                                            const tdClassName = ['pcTaskTable__td', tdMetaClass].filter(Boolean).join(' ')

                                            return (
                                                <td key={cell.id} className={tdClassName}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            )
                                        })}
                                    </SortableRow>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}