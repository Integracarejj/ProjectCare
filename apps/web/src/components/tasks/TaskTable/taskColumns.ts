import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { TaskRow } from './TaskTable'

type TreeTaskRow = TaskRow & { subRows?: TreeTaskRow[] }

function fmtDate(value: unknown): string {
    if (typeof value !== 'string' || !value) return ''
    // Accept YYYY-MM-DD (seed) or ISO; display compact local date.
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString()
}

export const taskColumns: ColumnDef<TreeTaskRow, any>[] = [
    {
        id: 'taskId',
        header: 'Task ID',
        accessorFn: row => row.wbs ?? row.id,
        cell: ({ getValue }) => String(getValue() ?? ''),
    },
    {
        id: 'task',
        header: 'Task',
        accessorKey: 'title',
        cell: ({ row }) => {
            const canExpand = row.getCanExpand()
            const isExpanded = row.getIsExpanded()
            const depth = row.depth
            const indent = depth * 16

            const toggleButton = canExpand
                ? React.createElement(
                    'button',
                    {
                        type: 'button',
                        onClick: row.getToggleExpandedHandler(),
                        'aria-label': isExpanded ? 'Collapse' : 'Expand',
                        style: {
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: '1px solid rgba(17, 24, 39, 0.14)',
                            background: '#fff',
                            cursor: 'pointer',
                            lineHeight: 1,
                        },
                    },
                    isExpanded ? '▾' : '▸'
                )
                : React.createElement('span', { style: { width: 22, display: 'inline-block' } })

            return React.createElement(
                'div',
                {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        paddingLeft: indent,
                    },
                },
                toggleButton,
                React.createElement('span', null, row.original.title)
            )
        },
    },
    {
        id: 'resource',
        header: 'Resource',
        accessorFn: () => '',
        cell: () => '',
    },
    {
        id: 'start',
        header: 'Start',
        accessorKey: 'startDate',
        cell: ({ getValue }) => fmtDate(getValue()),
    },
    {
        id: 'finish',
        header: 'Finish',
        accessorKey: 'finishDate',
        cell: ({ getValue }) => fmtDate(getValue()),
    },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => String(getValue() ?? ''),
    },
]

export type { TaskRow }