import React, { useEffect, useRef } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { TaskRow as BaseTaskRow } from './TaskTable'
import { DragHandle } from './DragHandle'

export type TaskRow = BaseTaskRow
type TreeTaskRow = TaskRow & { subRows?: TreeTaskRow[] }

function fmtDate(value: unknown): string {
    if (typeof value !== 'string' || !value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString()
}

function fmtPercent(value: unknown): string {
    if (value === null || value === undefined || value === '') return ''
    const n = typeof value === 'number' ? value : Number(value)
    if (Number.isNaN(n)) return String(value)
    return `${Math.max(0, Math.min(100, Math.round(n)))}%`
}

function fmtDeps(value: unknown): string {
    if (!value) return ''
    if (Array.isArray(value)) return value.length ? `${value.length}` : ''
    return String(value)
}

function IndeterminateCheckbox(props: {
    checked: boolean
    indeterminate?: boolean
    disabled?: boolean
    ariaLabel: string
    onChange: React.ChangeEventHandler<HTMLInputElement>
}) {
    const { checked, indeterminate, disabled, ariaLabel, onChange } = props
    const ref = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = Boolean(indeterminate) && !checked
        }
    }, [indeterminate, checked])

    return React.createElement('input', {
        ref,
        type: 'checkbox',
        className: 'pcTaskTable__checkbox',
        checked,
        disabled,
        'aria-label': ariaLabel,
        onChange,
        onClick: (e: any) => e.stopPropagation(),
    })
}

function SelectionHeader({ table }: any) {
    return React.createElement(IndeterminateCheckbox, {
        checked: table.getIsAllRowsSelected(),
        indeterminate: table.getIsSomeRowsSelected(),
        ariaLabel: 'Select all rows',
        onChange: table.getToggleAllRowsSelectedHandler(),
    })
}

function SelectionCell({ row }: any) {
    return React.createElement(IndeterminateCheckbox, {
        checked: row.getIsSelected(),
        indeterminate: row.getIsSomeSelected?.(),
        ariaLabel: 'Select row',
        onChange: row.getToggleSelectedHandler(),
    })
}

function TaskTitleCell({ row, table }: any) {
    const meta = table.options.meta ?? {}

    // ✅ Always derive indent from the flat model depth map (stable during drag)
    const stableDepthMap: Map<string, number> | undefined =
        meta.getStableDepthMap?.()
    const stableDepth = stableDepthMap?.get(row.original.id) ?? row.depth
    const indent = stableDepth * 16

    const onClick = () => {
        if (meta.getFocusedRowId?.() === row.original.id) {
            meta.setFocusedRowId?.(null)
        } else {
            meta.setFocusedRowId?.(row.original.id)
        }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        const focusedId = meta?.getFocusedRowId?.()
        if (focusedId !== row.original.id) return

        if (e.key === 'Tab') {
            e.preventDefault()
            if (e.shiftKey) meta?.outdent?.(row.original.id)
            else meta?.indent?.(row.original.id)
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            meta?.focusNextRow?.()
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            meta?.focusPrevRow?.()
        }
        if (e.key === 'Enter') {
            e.preventDefault()
            console.log('Edit task', row.original.id)
        }
    }

    const canExpand = row.getCanExpand()
    const isExpanded = row.getIsExpanded()
    const toggle = canExpand
        ? React.createElement(
            'button',
            {
                type: 'button',
                className: 'pcTaskTable__expander',
                onClick: (e: any) => {
                    e.stopPropagation()
                    row.toggleExpanded()
                },
                onMouseDown: (e: any) => e.stopPropagation(),
                'aria-label': isExpanded ? 'Collapse row' : 'Expand row',
            },
            isExpanded ? '▾' : '▸'
        )
        : React.createElement('span', { className: 'pcTaskTable__expanderSpacer' })

    return React.createElement(
        'div',
        {
            className: 'pcTaskTable__taskCell',
            style: { paddingLeft: indent },
            tabIndex: 0,
            onClick,
            onKeyDown,
        },
        toggle,
        React.createElement(
            'span',
            { className: 'pcTaskTable__taskTitle' },
            row.original.title
        )
    )
}

export const taskColumns: ColumnDef<TreeTaskRow, unknown>[] = [
    {
        id: 'drag',
        header: '',
        cell: () => React.createElement(DragHandle, {}),
        size: 24,
    },
    {
        id: 'select',
        header: ({ table }) => React.createElement(SelectionHeader, { table }),
        cell: ({ row }) => React.createElement(SelectionCell, { row }),
        size: 40,
    },

    // Core identifiers
    {
        id: 'taskId',
        header: 'Task ID',
        accessorFn: row => row.wbs ?? row.id,
        size: 90,
    },
    {
        id: 'task',
        header: 'Task',
        accessorKey: 'title',
        cell: ({ row, table }) =>
            React.createElement(TaskTitleCell, { row, table }),
        size: 320,
    },

    // ✅ New columns based on your JSON seed fields
    {
        id: 'resource',
        header: 'Resource',
        accessorKey: 'resource',
        size: 160,
    },
    {
        id: 'start',
        header: 'Start',
        accessorKey: 'startDate',
        cell: ({ getValue }) => fmtDate(getValue()),
        size: 110,
    },
    {
        id: 'finish',
        header: 'Finish',
        accessorKey: 'finishDate',
        cell: ({ getValue }) => fmtDate(getValue()),
        size: 110,
    },
    {
        id: 'duration',
        header: 'Duration',
        accessorKey: 'duration',
        cell: ({ getValue }) => {
            const v = getValue() as any
            if (v === null || v === undefined || v === '') return ''
            return String(v)
        },
        size: 90,
    },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        size: 120,
    },
    {
        id: 'priority',
        header: 'Priority',
        accessorKey: 'priority',
        size: 110,
    },
    {
        id: 'percentComplete',
        header: '% Complete',
        accessorKey: 'percentComplete',
        cell: ({ getValue }) => fmtPercent(getValue()),
        size: 110,
    },
    {
        id: 'type',
        header: 'Type',
        accessorKey: 'type',
        size: 100,
    },
    {
        id: 'dependencies',
        header: 'Deps',
        accessorKey: 'dependencies',
        cell: ({ getValue }) => fmtDeps(getValue()),
        size: 70,
    },
    {
        id: 'createdAt',
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => fmtDate(getValue()),
        size: 120,
    },
]