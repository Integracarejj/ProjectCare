import * as React from 'react'
import { useMemo, useEffect, useRef } from 'react'
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

export type TreeTaskRow = TreeRow<TaskRow>

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

    // Move browser focus when focused row changes
    useEffect(() => {
        if (!focusedId) return
        if (!tableRef.current) return

        const el = tableRef.current.querySelector(
            `[data-row-id="${focusedId}"] .pcTaskTable__taskCell`
        ) as HTMLElement | null

        if (el) el.focus()
    }, [focusedId])

    return React.createElement(
        'table',
        { ref: tableRef, className: 'pcTaskTable', 'aria-label': ariaLabel },
        React.createElement(
            'thead',
            { className: 'pcTaskTable__head' },
            table.getHeaderGroups().map(headerGroup =>
                React.createElement(
                    'tr',
                    { key: headerGroup.id, className: 'pcTaskTable__headRow' },
                    headerGroup.headers.map(header =>
                        React.createElement(
                            'th',
                            {
                                key: header.id,
                                className: 'pcTaskTable__th',
                                colSpan: header.colSpan,
                                scope: 'col',
                            },
                            header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )
                        )
                    )
                )
            )
        ),
        React.createElement(
            'tbody',
            { className: 'pcTaskTable__body' },
            table.getRowModel().rows.length === 0
                ? React.createElement(
                    'tr',
                    {},
                    React.createElement(
                        'td',
                        {
                            className:
                                'pcTaskTable__td pcTaskTable__empty',
                            colSpan: columns.length,
                        },
                        'No tasks yet.'
                    )
                )
                : table.getRowModel().rows.map(row =>
                    React.createElement(
                        'tr',
                        {
                            key: row.id,
                            'data-row-id': row.original.id,
                            className: [
                                'pcTaskTable__row',
                                row.getIsSelected() ? 'is-selected' : '',
                                focusedId === row.original.id
                                    ? 'is-focused'
                                    : '',
                            ].join(' '),
                            onClick: () =>
                                meta?.setFocusedRowId?.(row.original.id),
                        },
                        row.getVisibleCells().map(cell =>
                            React.createElement(
                                'td',
                                {
                                    key: cell.id,
                                    className: [
                                        'pcTaskTable__td',
                                        cell.column.id === 'select'
                                            ? 'pcTaskTable__selectCell'
                                            : '',
                                    ].join(' '),
                                },
                                flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )
                            )
                        )
                    )
                )
        )
    )
}