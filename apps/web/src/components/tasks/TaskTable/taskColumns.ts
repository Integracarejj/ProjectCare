import React, { useEffect, useRef } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { TaskRow } from './TaskTable'

type TreeTaskRow = TaskRow & { subRows?: TreeTaskRow[] }

function fmtDate(value: unknown): string {
    if (typeof value !== 'string' || !value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString()
}

/**
 * IndeterminateCheckbox
 * ---------------------------------------------------------------------------
 * HTML supports an "indeterminate" visual state (not an attribute),
 * so we set it imperatively via a ref.
 *
 * NOTE: This is JSX-free to keep taskColumns.ts compatible with
 * "erasableSyntaxOnly" + non-TSX compilation.
 */
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

function TaskTitleCell(props: { row: any }) {
    const row = props.row
    const canExpand = row.getCanExpand()
    const isExpanded = row.getIsExpanded()
    const depth = row.depth
    const indent = depth * 16

    const toggle = canExpand
        ? React.createElement(
            'button',
            {
                type: 'button',
                className: 'pcTaskTable__expander',
                onClick: row.getToggleExpandedHandler(),
                'aria-label': isExpanded ? 'Collapse' : 'Expand',
            },
            isExpanded ? '▾' : '▸'
        )
        : React.createElement('span', {
            className: 'pcTaskTable__expanderSpacer',
            'aria-hidden': true,
        })

    return React.createElement(
        'div',
        { className: 'pcTaskTable__taskCell', style: { paddingLeft: indent } },
        toggle,
        React.createElement('span', { className: 'pcTaskTable__taskTitle' }, row.original.title)
    )
}

/**
 * Phase D1: Selection column
 * ---------------------------------------------------------------------------
 * - Header checkbox toggles all rows (no pagination yet)
 * - Row checkbox toggles only that row
 * - No extra behaviors/UI beyond checkboxes
 */
function SelectionHeader(props: { table: any }) {
    const table = props.table
    const isAll = table.getIsAllRowsSelected()
    const isSome = table.getIsSomeRowsSelected()

    return React.createElement(
        'div',
        { className: 'pcTaskTable__selectHeader' },
        React.createElement(IndeterminateCheckbox, {
            checked: isAll,
            indeterminate: isSome,
            ariaLabel: isAll ? 'Deselect all rows' : 'Select all rows',
            onChange: table.getToggleAllRowsSelectedHandler(),
        })
    )
}

function SelectionCell(props: { row: any }) {
    const row = props.row
    const canSelect = row.getCanSelect()
    const isSelected = row.getIsSelected()
    const isSomeSelected = typeof row.getIsSomeSelected === 'function' ? row.getIsSomeSelected() : false

    return React.createElement(
        'div',
        { className: 'pcTaskTable__selectCellInner' },
        React.createElement(IndeterminateCheckbox, {
            checked: isSelected,
            indeterminate: isSomeSelected,
            disabled: !canSelect,
            ariaLabel: isSelected ? `Deselect row ${row.id}` : `Select row ${row.id}`,
            onChange: row.getToggleSelectedHandler(),
        })
    )
}

export const taskColumns: ColumnDef<TreeTaskRow, unknown>[] = [
    {
        id: 'select',
        header: ({ table }) => React.createElement(SelectionHeader, { table }),
        cell: ({ row }) => React.createElement(SelectionCell, { row }),
        size: 44,
        minSize: 44,
        maxSize: 56,
        enableSorting: false,
    },
    {
        id: 'taskId',
        header: 'Task ID',
        accessorFn: (row: TreeTaskRow) => row.wbs ?? row.id,
        cell: ({ getValue }) => String(getValue() ?? ''),
    },
    {
        id: 'task',
        header: 'Task',
        accessorKey: 'title',
        cell: ({ row }) => React.createElement(TaskTitleCell, { row }),
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