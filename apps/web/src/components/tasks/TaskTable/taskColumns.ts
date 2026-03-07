
import React, { useEffect, useRef } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { TreeTaskRow } from './TaskTable'

function fmtDate(value: unknown): string {
    if (typeof value !== 'string' || !value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString()
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
    const depth = row.depth
    const indent = depth * 16
    const meta = table.options.meta ?? {}

    const onClick = () => {
        if (meta.getFocusedRowId?.() === row.original.id) {
            meta.setFocusedRowId?.(null) // toggle off focus
        } else {
            meta.setFocusedRowId?.(row.original.id)
        }
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const focusedId = meta.getFocusedRowId?.()
        if (focusedId !== row.original.id) return

        if (e.key === 'Tab') {
            e.preventDefault()
            if (e.shiftKey) meta.outdent?.(row.original.id)
            else meta.indent?.(row.original.id)
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            meta.focusNextRow?.()
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            meta.focusPrevRow?.()
        }
        if (e.key === 'Escape') {
            e.preventDefault()
            meta.setFocusedRowId?.(null)
        }
    }

    const canExpand = row.getCanExpand()
    const isExpanded = row.getIsExpanded()

    const toggle = canExpand
        ? React.createElement(
            'button',
            {
                className: 'pcTaskTable__expander',
                onClick: row.getToggleExpandedHandler(),
            },
            isExpanded ? '▾' : '▸'
        )
        : React.createElement('span', {
            className: 'pcTaskTable__expanderSpacer',
        })

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
        React.createElement('span', { className: 'pcTaskTable__taskTitle' }, row.original.title)
    )
}

export const taskColumns: ColumnDef<TreeTaskRow, unknown>[] = [
    {
        id: 'select',
        header: ({ table }) => React.createElement(SelectionHeader, { table }),
        cell: ({ row }) => React.createElement(SelectionCell, { row }),
        size: 40,
    },
    {
        id: 'taskId',
        header: 'Task ID',
        accessorFn: row => row.wbs ?? row.id,
    },
    {
        id: 'task',
        header: 'Task',
        accessorKey: 'title',
        cell: ({ row, table }) => React.createElement(TaskTitleCell, { row, table }),
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
    },
]