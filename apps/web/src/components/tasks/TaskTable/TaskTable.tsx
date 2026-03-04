import { useMemo, useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    type ColumnDef,
    type ExpandedState,
} from '@tanstack/react-table'
import './TaskTable.css'

export type TaskRow = {
    id: string
    projectId: string
    parentId: string | null
    wbs?: string
    title: string
    status: 'Backlog' | 'Not Started' | 'In Progress' | 'Blocked' | 'Complete' | string
    startDate?: string | null
    finishDate?: string | null
    order?: number
    isMilestone?: boolean
    createdAt?: string
    // NOTE: keep this flat for storage. We will only add subRows at runtime.
}

// Runtime-only row type used by TanStack getSubRows.
type TreeTaskRow = TaskRow & { subRows?: TreeTaskRow[] }

type TaskTableProps = {
    rows: TaskRow[]
    columns: ColumnDef<TreeTaskRow, any>[]
    ariaLabel?: string
}

function buildTaskTree(flat: TaskRow[]): TreeTaskRow[] {
    // Create node map
    const byId = new Map<string, TreeTaskRow>()
    for (const t of flat) {
        byId.set(t.id, { ...t, subRows: [] })
    }

    // Attach children to parents
    const roots: TreeTaskRow[] = []
    for (const node of byId.values()) {
        if (node.parentId && byId.has(node.parentId)) {
            byId.get(node.parentId)!.subRows!.push(node)
        } else {
            roots.push(node)
        }
    }

    // Stable ordering: use `order` if present, else wbs, else title, else id.
    const sortNodes = (nodes: TreeTaskRow[]) => {
        nodes.sort((a, b) => {
            const ao = a.order ?? Number.POSITIVE_INFINITY
            const bo = b.order ?? Number.POSITIVE_INFINITY
            if (ao !== bo) return ao - bo

            const aw = a.wbs ?? ''
            const bw = b.wbs ?? ''
            if (aw !== bw) return aw.localeCompare(bw)

            const at = a.title ?? ''
            const bt = b.title ?? ''
            if (at !== bt) return at.localeCompare(bt)

            return a.id.localeCompare(b.id)
        })

        for (const n of nodes) {
            if (n.subRows && n.subRows.length) sortNodes(n.subRows)
        }
    }

    sortNodes(roots)

    // If a node has no children, remove empty subRows to keep rendering clean.
    const prune = (nodes: TreeTaskRow[]) => {
        for (const n of nodes) {
            if (n.subRows && n.subRows.length === 0) delete n.subRows
            else if (n.subRows) prune(n.subRows)
        }
    }
    prune(roots)

    return roots
}

export function TaskTable({ rows, columns, ariaLabel }: TaskTableProps) {
    const [expanded, setExpanded] = useState<ExpandedState>({})

    const treeRows = useMemo(() => buildTaskTree(rows), [rows])

    const table = useReactTable({
        data: treeRows,
        columns,
        state: { expanded },
        onExpandedChange: setExpanded,
        getSubRows: (row) => row.subRows ?? [],
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    return (
        <div className="pcTaskTable" aria-label={ariaLabel}>
            <div className="pcTaskTable__scroller">
                <table className="pcTaskTable__table">
                    <thead className="pcTaskTable__thead">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="pcTaskTable__tr pcTaskTable__tr--head">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="pcTaskTable__th">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="pcTaskTable__tbody">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr className="pcTaskTable__tr">
                                <td className="pcTaskTable__td" colSpan={columns.length}>
                                    <div className="pcTaskTable__empty">No tasks yet.</div>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="pcTaskTable__tr">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="pcTaskTable__td">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}