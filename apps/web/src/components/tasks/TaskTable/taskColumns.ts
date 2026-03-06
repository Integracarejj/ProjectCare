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
 * NOTE: JSX-free to keep taskColumns.ts compatible with
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

/**
 * Phase D1: Selection column
 * ---------------------------------------------------------------------------
 * - Header checkbox toggles all rows (no pagination yet)
 * - Row checkbox toggles only that row
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
    const isSomeSelected =
        typeof row.getIsSomeSelected === 'function' ? row.getIsSomeSelected() : false

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

/**
 * TaskTitleCell (keyboard-first)
 * ---------------------------------------------------------------------------
 * Goals:
 * - Click task cell selects row (no checkbox dependency)
 * - Tab indents, Shift+Tab outdents
 * - Shows a "focused" state hook via data-focused attribute
 *
 * Notes:
 * - We keep this JSX-free and small.
 * - Indent/outdent functions are provided via table.options.meta from ProjectsPage.
 */
function TaskTitleCell(props: { row: any; table: any }) {
    const row = props.row
    const table = props.table

    const canExpand = row.getCanExpand()
    const isExpanded = row.getIsExpanded()
    const depth = row.depth
    const indent = depth * 16

    const isSelected = row.getIsSelected?.() ?? false

    const onClick = () => {
        // Make the row selected when user clicks the task cell
        if (typeof row.toggleSelected === 'function') {
            row.toggleSelected()
        }
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // We only run structural actions when the row is selected
        if (!row.getIsSelected?.()) return

        if (e.key === 'Tab') {
            e.preventDefault()

            const meta = table?.options?.meta as
                | { indent?: (id: string) => void; outdent?: (id: string) => void }
                | undefined

            if (e.shiftKey) {
                meta?.outdent?.(row.original.id)
            } else {
                meta?.indent?.(row.original.id)
            }
        }
    }

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
        {
            className: 'pcTaskTable__taskCell',
            style: { paddingLeft: indent },
            tabIndex: 0,
            onClick,
            onKeyDown,
            // Hook for your "active row" visuals
            'data-focused': isSelected ? 'true' : 'false',
            role: 'button',
            'aria-label': 'Task row (Tab to indent, Shift+Tab to outdent)',
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
        // IMPORTANT: we pass both row and table so the cell can call meta.indent/outdent
        cell: ({ row, table }) => React.createElement(TaskTitleCell, { row, table }),
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