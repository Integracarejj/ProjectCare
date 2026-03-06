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
    // NOTE: keep this flat for storage. We will only add subRows at runtime.
}

// Runtime-only row type used by TanStack getSubRows.
type TreeTaskRow = TreeRow<TaskRow>

type TaskTableProps = {
    rows: TaskRow[]
    columns: ColumnDef<TreeTaskRow, unknown>[]
    ariaLabel?: string
}

/**
 * TaskTable (thin TanStack wrapper)
 * ---------------------------------------------------------------------------
 * Intentional constraints:
 * - No feature logic here (sorting/filtering/editing/etc.)
 * - No data fetching
 * - No business rules
 *
 * Row selection is enabled here as controlled state wiring only.
 * The UI for selection lives in the columns module.
 */
export function TaskTable({ rows, columns, ariaLabel = 'Tasks table' }: TaskTableProps) {
    const { expanded, setExpanded, rowSelection, setRowSelection } = useTaskTableState()

    // Build the runtime tree from flat rows. Keeps storage SQL-friendly.
    const treeRows = useMemo(() => buildTaskTree(rows), [rows])

    const table = useReactTable({
        data: treeRows,
        columns,
        state: { expanded, rowSelection },
        onExpandedChange: setExpanded,
        onRowSelectionChange: setRowSelection,

        // Keep selection keys stable across rebuilds/rerenders:
        // TanStack row selection is keyed by rowId — use our persisted task id.
        getRowId: row => row.id,

        // Enable tree expansion
        getSubRows: row => row.subRows ?? [],
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),

        // Phase D1: enable selection (UI is in column module)
        enableRowSelection: true,
        enableMultiRowSelection: true,

        // Keep selection behavior simple and explicit for now:
        // selecting a parent should NOT implicitly select children in Phase D1.
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
                        <tr key={row.id} className="pcTaskTable__row">
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