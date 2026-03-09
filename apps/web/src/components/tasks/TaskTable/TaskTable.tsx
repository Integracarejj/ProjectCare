import { useMemo, useEffect, useRef, useState } from 'react'
import {
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
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import './TaskTable.css'
import { buildTaskTree, type TreeRow } from './taskTree'
import { useTaskTableState } from './useTaskTableState'
import { moveTask } from './taskDnD'
import { TaskTableViewport } from './TaskTableViewport'

export type TaskRow = {
    id: string
    projectId: string
    parentId: string | null

    wbs?: string
    title: string

    status?:
    | 'Backlog'
    | 'Not Started'
    | 'In Progress'
    | 'Blocked'
    | 'Complete'
    | string

    type?: 'summary' | 'task' | string
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent' | string
    resource?: string | null
    percentComplete?: number | null
    startDate?: string | null
    finishDate?: string | null
    duration?: number | null
    dependencies?: string[] | null

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

    onRowsChange?: (nextRows: TaskRow[]) => void

    // stable depth derived from flat rows
    getStableDepthMap?: () => Map<string, number>
}

function computeStableDepthMap(rows: TaskRow[]): Map<string, number> {
    const parentById = new Map<string, string | null>()
    for (const r of rows) parentById.set(r.id, r.parentId ?? null)

    const memo = new Map<string, number>()
    const visiting = new Set<string>()

    const depthOf = (id: string): number => {
        if (memo.has(id)) return memo.get(id)!
        if (visiting.has(id)) return 0
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

type TaskTableProps = {
    rows: TaskRow[]
    columns: ColumnDef<TreeTaskRow, any>[]
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

    const treeRows = useMemo(() => buildTaskTree(rows), [rows])

    // DnD + drop targeting state
    const [activeId, setActiveId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | null>(null)

    const stableDepthMap = useMemo(() => computeStableDepthMap(rows), [rows])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    )

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

    const focusedId = composedMeta?.getFocusedRowId?.() ?? null
    const tableRootRef = useRef<HTMLDivElement | null>(null)

    // Keep keyboard focus aligned with focusedRowId
    useEffect(() => {
        if (!focusedId) return
        const el = tableRootRef.current?.querySelector(
            `[data-row-id="${focusedId}"] .pcTaskTable__taskCell`
        ) as HTMLElement | null
        if (el) el.focus()
    }, [focusedId])

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

    // Must match render order
    const visibleRowIds = table.getRowModel().rows.map(r => r.original.id)

    const getRowClassName = (row: any) => {
        const isFocused = focusedId === row.original.id
        const isSelected = row.getIsSelected()
        const isOver = overId === row.original.id
        const isActive = activeId === row.original.id

        return [
            'pcTaskTable__row',
            isSelected ? 'is-selected' : '',
            isFocused ? 'is-focused' : '',
            isOver ? 'is-drop-target' : '',
            isOver && isOverSummary ? 'is-drop-parent' : '',
            isActive ? 'is-dragging' : '',
        ]
            .filter(Boolean)
            .join(' ')
    }

    return (
        <div ref={tableRootRef}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDragCancel={onDragCancel}
            >
                <SortableContext
                    items={visibleRowIds}
                    strategy={verticalListSortingStrategy}
                >
                    <TaskTableViewport
                        table={table as any}
                        ariaLabel={ariaLabel}
                        getRowClassName={getRowClassName}
                        getRowId={(row: any) => row.original.id}
                    />

                    <DragOverlay>
                        {activeRow ? (
                            <div className="pcTaskTable__dragOverlayRow">
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
                </SortableContext>
            </DndContext>
        </div>
    )
}