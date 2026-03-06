/**
 * Phase D2 — Indent / Outdent helpers (NO numbering)
 * ---------------------------------------------------------------------------
 * Operates on flat rows:
 * - Updates parentId + deterministic order only
 * - No mutations
 * - Tree rebuilt elsewhere via buildTaskTree(flatRows)
 */

export type FlatTaskLike = {
    id: string
    projectId: string
    parentId: string | null
    order?: number
    title?: string
    wbs?: string
}

type CompareInput = Pick<FlatTaskLike, 'id' | 'order' | 'wbs' | 'title'>

function compareStable(a: CompareInput, b: CompareInput) {
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

function getGroup<T extends FlatTaskLike>(
    rows: T[],
    projectId: string,
    parentId: string | null
) {
    return rows
        .filter(r => r.projectId === projectId && r.parentId === parentId)
        .slice()
        .sort(compareStable)
}

function replaceMany<T extends FlatTaskLike>(rows: T[], updates: Map<string, Partial<T>>): T[] {
    if (updates.size === 0) return rows
    return rows.map(r => {
        const patch = updates.get(r.id)
        return patch ? ({ ...r, ...patch } as T) : r
    })
}

function normalizeGroupOrder<T extends FlatTaskLike>(group: T[], updates: Map<string, Partial<T>>) {
    for (let i = 0; i < group.length; i++) {
        updates.set(group[i].id, { ...(updates.get(group[i].id) as any), order: i + 1 } as Partial<T>)
    }
}

/**
 * Indent: make task a child of its previous sibling (same level).
 * Appends to end of new parent's children.
 */
export function indentTask<T extends FlatTaskLike>(rows: T[], taskId: string): T[] {
    const target = rows.find(r => r.id === taskId)
    if (!target) return rows

    const siblings = getGroup(rows, target.projectId, target.parentId)
    const idx = siblings.findIndex(s => s.id === taskId)
    if (idx <= 0) return rows // no previous sibling to indent under

    const newParent = siblings[idx - 1]
    const newParentId = newParent.id

    const updates = new Map<string, Partial<T>>()

    // Set target as child of previous sibling and push to end via order
    const newChildren = getGroup(rows, target.projectId, newParentId)
    const maxOrder = newChildren.reduce((m, c) => Math.max(m, c.order ?? 0), 0)

    updates.set(taskId, { parentId: newParentId as any, order: maxOrder + 1 } as Partial<T>)

    // Normalize old sibling group (without target)
    normalizeGroupOrder(siblings.filter(s => s.id !== taskId), updates)

    // Normalize new parent's children (including target)
    const after = replaceMany(rows, updates)
    normalizeGroupOrder(getGroup(after, target.projectId, newParentId), updates)

    return replaceMany(rows, updates)
}

/**
 * Outdent: move task up one level (becomes sibling of its parent).
 * Inserts immediately AFTER its parent.
 */
export function outdentTask<T extends FlatTaskLike>(rows: T[], taskId: string): T[] {
    const target = rows.find(r => r.id === taskId)
    if (!target || !target.parentId) return rows

    const parent = rows.find(r => r.id === target.parentId)
    const newParentId = parent?.parentId ?? null

    const updates = new Map<string, Partial<T>>()

    // Normalize old parent group (without target)
    normalizeGroupOrder(getGroup(rows, target.projectId, target.parentId).filter(s => s.id !== taskId), updates)

    // Build new group, insert after parent
    const newGroup = getGroup(rows, target.projectId, newParentId).filter(s => s.id !== taskId)

    const insertAfterId = parent?.id ?? null
    const insertAt = insertAfterId
        ? Math.max(0, newGroup.findIndex(s => s.id === insertAfterId) + 1)
        : newGroup.length

    const rebuilt = newGroup.slice()
    rebuilt.splice(insertAt, 0, { ...target, parentId: newParentId } as T)

    updates.set(taskId, { parentId: newParentId as any } as Partial<T>)
    normalizeGroupOrder(rebuilt, updates)

    return replaceMany(rows, updates)
}
