import { useMemo } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import './TaskTable.css'
import { buildTaskTree, type TreeRow } from './taskTree'
import { useTaskTableState } from './useTaskTableState'

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
}

type TaskTableProps = {
    rows: TaskRow[]
    columns: ColumnDef<TreeTaskRow, unknown>[]
    ariaLabel?: string
    meta?: TaskTableMeta
}

export function TaskTable({ rows, columns, ariaLabel = 'Tasks table', meta }: TaskTableProps) {
    const { expanded, setExpanded, rowSelection, setRowSelection } = useTaskTableState()

    const treeRows = useMemo(() => buildTaskTree(rows), [rows])

    const table = useReactTable({
        data: treeRows,
        columns,
        meta, // ✅ TanStack core option for custom callbacks 
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

    return (
        <table className="pcTaskTable" aria-label={ariaLabel}>
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
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>

            <tbody className="pcTaskTable__body">
                {table.getRowModel().rows.length === 0 ? (
                    <tr className="pcTaskTable__row">
                        <td className="pcTaskTable__td pcTaskTable__empty" colSpan={columns.length}>
                            No tasks yet.
                        </td>
                    </tr>
                ) : (
                    table.getRowModel().rows.map(row => (
                        <tr
                            key={row.id}
                            className="pcTaskTable__row"
                            data-selected={row.getIsSelected() ? 'true' : 'false'}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td
                                    key={cell.id}
                                    className={[
                                        'pcTaskTable__td',
                                        cell.column.id === 'select' ? 'pcTaskTable__selectCell' : '',
                                    ].join(' ')}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    )
}