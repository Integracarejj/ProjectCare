import { useMemo, useEffect, useRef, useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    DndContext,
    closestCenter,
    DragOverlay,
    type DragEndEvent,
    type DragStartEvent,
    type DragOverEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import './TaskTable.css'
import { buildTaskTree, type TreeRow } from './taskTree'
import { useTaskTableState } from './useTaskTableState'
import { moveTask } from './taskDnD'
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

    // Persist state upward (ProjectsPage owns rows)
    onRowsChange?: (nextRows: TaskRow[]) => void

    // ✅ NEW: stable depth derived from flat rows (prevents “slide right” during drag)
    getStableDepthMap?: () => Map<string, number>
}

type TaskTableProps = {
    rows: TaskRow[]
    columns: ColumnDef<TreeTaskRow, unknown>[]
    ariaLabel?: string
    meta?: TaskTableMeta
}

// Compute stable depth strictly from the flat model (parentId chain).
// This will NOT change during drag (only changes after drop when parentId updates).
function computeStableDepthMap(rows: TaskRow[]): Map<string, number> {
    const parentById = new Map<string, string | null>()
    for (const r of rows) parentById.set(r.id, r.parentId ?? null)

    const memo = new Map<string, number>()
    const visiting = new Set<string>()

    const depthOf = (id: string): number => {
        if (memo.has(id)) return memo.get(id)!
        if (visiting.has(id)) return 0 // cycle guard
        visiting.add(id)
        const pid = parentById.get(id) ?? null
        const d = pid ? depthOf(pid) + 1 : 0
        visiting.delete(id)
        memo.set(id, d)
        return d
    }

    const out = new Map<string, number>()
    for (const r of rows) out.set(r.id, depthOf(r.id))
    return out
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

    // Drag state for styling + overlay
    const [activeId, setActiveId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | null>(null)

    // ✅ stable depth map from FLAT rows (the key fix)
    const stableDepthMap = useMemo(() => computeStableDepthMap(rows), [rows])

    // Slight movement required before drag starts => click reliability
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    )

    // Compose meta so cells can use stable depth map
    const composedMeta: TaskTableMeta = useMemo(() => {
        return {
            ...(meta ?? {}),
            getStableDepthMap: () => stableDepthMap,
        }
    }, [meta, stableDepthMap])

    const table = useReactTable({
        data: treeRows,
        columns,
        meta: composedMeta,
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

    const focusedId = composedMeta?.getFocusedRowId?.()

    // Keep keyboard focus aligned with our “focusedRowId” anchor
    useEffect(() => {
        if (!focusedId) return
        if (!tableRef.current) return
        const el = tableRef.current.querySelector(
            `[data-row-id="${focusedId}"] .pcTaskTable__taskCell`
        ) as HTMLElement | null
        if (el) el.focus()
    }, [focusedId])

    // Determine if current "over" is a summary task (has children)
    const isOverSummary = useMemo(() => {
        if (!overId) return false
        return rows.some(r => r.parentId === overId)
    }, [rows, overId])

    const activeRow = useMemo(() => {
        if (!activeId) return null
        return rows.find(r => r.id === activeId) ?? null
    }, [activeId, rows])

    const onDragStart = (event: DragStartEvent) => {
        const id = event.active?.id ? String(event.active.id) : null
        setActiveId(id)
    }

    const onDragOver = (event: DragOverEvent) => {
        setOverId(event.over?.id ? String(event.over.id) : null)
    }

    const onDragEnd = (event: DragEndEvent) => {
        const aId = event.active?.id ? String(event.active.id) : null
        const oId = event.over?.id ? String(event.over.id) : null

        setActiveId(null)
        setOverId(null)

        if (!aId || !oId) return
        if (aId === oId) return

        const nextRows = moveTask(rows, aId, oId)
        composedMeta?.onRowsChange?.(nextRows)
        composedMeta?.setFocusedRowId?.(aId)
    }

    const onDragCancel = () => {
        setActiveId(null)
        setOverId(null)
    }

    // IMPORTANT: SortableContext items must match visible render order
    const visibleRowIds = table.getRowModel().rows.map(r => r.original.id)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
        >
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

                <SortableContext
                    items={visibleRowIds}
                    strategy={verticalListSortingStrategy}
                >
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
                            table.getRowModel().rows.map(row => {
                                const isFocused = focusedId === row.original.id
                                const isSelected = row.getIsSelected()
                                const isOver = overId === row.original.id
                                const isActive = activeId === row.original.id

                                const rowClassName = [
                                    'pcTaskTable__row',
                                    isSelected ? 'is-selected' : '',
                                    isFocused ? 'is-focused' : '',
                                    isOver ? 'is-drop-target' : '',
                                    isOver && isOverSummary ? 'is-drop-parent' : '',
                                    isActive ? 'is-dragging' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')

                                return (
                                    <SortableRow
                                        key={row.id}
                                        id={row.original.id}
                                        className={rowClassName}
                                        data-row-id={row.original.id}
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
                                )
                            })
                        )}
                    </tbody>
                </SortableContext>
            </table>

            {/* Overlay: show the row identity (handle + Task ID + title) */}
            <DragOverlay>
                {activeRow ? (
                    <div className="pcTaskTable__dragOverlayRow" role="presentation">
                        <span className="pcTaskTable__dragOverlayGrip">☰</span>
                        <span className="pcTaskTable__dragOverlayId">
                            {activeRow.wbs ?? activeRow.id}
                        </span>
                        <span className="pcTaskTable__dragOverlayTitle">
                            {activeRow.title}
                        </span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}