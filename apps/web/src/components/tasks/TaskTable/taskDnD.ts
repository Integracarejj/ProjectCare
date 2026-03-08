import type { TaskRow } from './TaskTable'

function compareStable(a: TaskRow, b: TaskRow) {
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
}

function getGroup(rows: TaskRow[], projectId: string, parentId: string | null) {
    return rows
        .filter(r => r.projectId === projectId && r.parentId === parentId)
        .slice()
        .sort(compareStable)
}

function applyPatch(rows: TaskRow[], patch: Map<string, Partial<TaskRow>>): TaskRow[] {
    if (patch.size === 0) return rows
    return rows.map(r => (patch.has(r.id) ? { ...r, ...patch.get(r.id)! } : r))
}

function normalizeOrder(group: TaskRow[], patch: Map<string, Partial<TaskRow>>) {
    group.forEach((r, idx) => {
        patch.set(r.id, { ...(patch.get(r.id) ?? {}), order: idx + 1 })
    })
}

function isSummary(rows: TaskRow[], id: string): boolean {
    return rows.some(r => r.parentId === id)
}

function wouldCreateCycle(rows: TaskRow[], movingId: string, newParentId: string): boolean {
    const parentById = new Map<string, string | null>()
    for (const r of rows) parentById.set(r.id, r.parentId ?? null)

    let cur: string | null = newParentId
    while (cur) {
        if (cur === movingId) return true
        cur = parentById.get(cur) ?? null
    }
    return false
}

/**
 * Move a task in a tree-aware way.
 * - Drop onto a summary => becomes child (append)
 * - Drop onto non-summary => becomes sibling near target row
 */
export function moveTask(rows: TaskRow[], activeId: string, overId: string): TaskRow[] {
    if (activeId === overId) return rows

    const active = rows.find(r => r.id === activeId)
    const over = rows.find(r => r.id === overId)
    if (!active || !over) return rows

    const projectId = active.projectId
    const oldParentId = active.parentId

    const droppingOntoSummary = isSummary(rows, overId)
    let desiredParentId: string | null = droppingOntoSummary ? overId : over.parentId

    if (desiredParentId && wouldCreateCycle(rows, activeId, desiredParentId)) {
        desiredParentId = over.parentId
    }

    const patch = new Map<string, Partial<TaskRow>>()

    // Remove active for deterministic group rebuilds
    const rowsWithoutActive = rows.filter(r => r.id !== activeId)

    // Normalize old parent group after removal
    normalizeOrder(getGroup(rowsWithoutActive, projectId, oldParentId), patch)

    if (droppingOntoSummary) {
        // Append as last child under the summary
        const childGroup = getGroup(rowsWithoutActive, projectId, desiredParentId)
        const rebuilt = childGroup.slice()
        rebuilt.push({ ...active, parentId: desiredParentId })

        patch.set(activeId, { parentId: desiredParentId })
        normalizeOrder(rebuilt, patch)
    } else {
        // Insert as sibling near 'over' inside desiredParentId group
        const newGroup = getGroup(rowsWithoutActive, projectId, desiredParentId)
        const insertAt = Math.max(0, newGroup.findIndex(r => r.id === overId))
        const rebuilt = newGroup.slice()
        rebuilt.splice(insertAt, 0, { ...active, parentId: desiredParentId })

        patch.set(activeId, { parentId: desiredParentId })
        normalizeOrder(rebuilt, patch)
    }

    // Re-add active (will be patched) and apply updates
    const withActiveRestored = [...rowsWithoutActive, active]
    return applyPatch(withActiveRestored, patch)
}