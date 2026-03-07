import { useMemo, useEffect, useRef } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'

import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

import './TaskTable.css'
import { buildTaskTree, type TreeRow } from './taskTree'
import { useTaskTableState } from './useTaskTableState'
import { reorderTasks } from './taskDnD'
import { SortableRow } from './SortableRow'

export type TaskRow = {
    id: string
    projectId: string
    parentId: string | null
    wbs?: string
    title: string
    status:
    | 'Backlog'
    | 'Not Started'
    | 'In Progress'
    | 'Blocked'
    | 'Complete'
    | string
    startDate?: string | null
    finishDate?: string | null
    order?: number
    isMilestone?: boolean
    createdAt?: string
}

type TreeTaskRow = TreeRow<TaskRow>

export type TaskTableMeta = {
    indent?: (taskId: string) => void
    outdent?: (taskId: string) => void
    getFocusedRowId?: () => string | null
    setFocusedRowId?: (id: string | null) => void
    focusNextRow?: () => void
    focusPrevRow?: () => void
}

type TaskTableProps = {
    rows: TaskRow[]
    columns: ColumnDef<TreeTaskRow, unknown>[]
    ariaLabel?: string
    meta?: TaskTableMeta
}

export function TaskTable({
    rows,
    columns,
    ariaLabel = 'Tasks table',
    meta,
}: TaskTableProps) {
    const { expanded, setExpanded, rowSelection, setRowSelection } =
        useTaskTableState()

    const tableRef = useRef<HTMLTableElement | null>(null)

    const treeRows = useMemo(() => buildTaskTree(rows), [rows])

    const table = useReactTable({
        data: treeRows,
        columns,
        meta,
        state: { expanded, rowSelection },
        onExpandedChange: setExpanded,
        onRowSelectionChange: setRowSelection,
        getRowId: row => row.id,
        getSubRows: row => row.subRows ?? [],
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableSubRowSelection: false,
    })

    const focusedId = meta?.getFocusedRowId?.()

    useEffect(() => {
        if (!focusedId) return
        if (!tableRef.current) return

        const el = tableRef.current.querySelector(
            `[data-row-id="${focusedId}"] .pcTaskTable__taskCell`
        ) as HTMLElement | null

        if (el) el.focus()
    }, [focusedId])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!active.id || !over?.id) return

        const newRows = reorderTasks(rows, active.id as string, over.id as string)
        if (newRows && meta?.setFocusedRowId) {
            meta.setFocusedRowId(active.id as string)
        }
    }

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table ref={tableRef} className="pcTaskTable" aria-label={ariaLabel}>
                <thead className="pcTaskTable__head">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="pcTaskTable__headRow">
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    className="pcTaskTable__th"
                                    colSpan={header.colSpan}
                                    scope="col"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <SortableContext items={rows.map(r => r.id)}>
                    <tbody className="pcTaskTable__body">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    className="pcTaskTable__td pcTaskTable__empty"
                                    colSpan={columns.length}
                                >
                                    No tasks yet.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <SortableRow
                                    key={row.id}
                                    id={row.original.id}
                                    className={[
                                        'pcTaskTable__row',
                                        row.getIsSelected() ? 'is-selected' : '',
                                        focusedId === row.original.id ? 'is-focused' : '',
                                    ].join(' ')}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className={[
                                                'pcTaskTable__td',
                                                cell.column.id === 'select'
                                                    ? 'pcTaskTable__selectCell'
                                                    : '',
                                            ].join(' ')}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </SortableRow>
                            ))
                        )}
                    </tbody>
                </SortableContext>
            </table>
        </DndContext>
    )
}