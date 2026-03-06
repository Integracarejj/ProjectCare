// apps/web/src/components/tasks/TaskTable/taskTree.ts
/**
 * Build a hierarchical task tree from flat rows.
 * ---------------------------------------------------------------------------
 * Guardrails:
 * - Flat storage only: we do NOT persist nested children arrays anywhere.
 * - Runtime-only: we add `subRows` purely for TanStack Table's getSubRows().
 * - Stable ordering: order -> wbs -> title -> id (same behavior as current).
 * - Pruning: remove empty subRows so leaf rows don't carry empty arrays.
 */

export type TreeRow<T> = T & { subRows?: Array<TreeRow<T>> }

type TreeInputRow = {
    id: string
    parentId: string | null
    order?: number
    wbs?: string
    title?: string
}

export function buildTaskTree<T extends TreeInputRow>(flatRows: T[]): Array<TreeRow<T>> {
    // Create node map (clone rows; never mutate caller objects)
    const byId = new Map<string, TreeRow<T>>()
    for (const r of flatRows) {
        byId.set(r.id, { ...(r as T), subRows: [] })
    }

    // Attach children to parents, defaulting to roots when parent is missing/invalid
    const roots: Array<TreeRow<T>> = []
    for (const node of byId.values()) {
        const pid = node.parentId
        const hasValidParent = !!pid && pid !== node.id && byId.has(pid)

        if (hasValidParent) {
            byId.get(pid!)!.subRows!.push(node)
        } else {
            roots.push(node)
        }
    }

    // Stable ordering: `order` if present, else `wbs`, else `title`, else `id`.
    const sortNodes = (nodes: Array<TreeRow<T>>) => {
        nodes.sort((a, b) => {
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
        })

        for (const n of nodes) {
            if (n.subRows && n.subRows.length) sortNodes(n.subRows)
        }
    }

    sortNodes(roots)

    // Prune empty subRows for leaf nodes to keep rendering clean
    const prune = (nodes: Array<TreeRow<T>>) => {
        for (const n of nodes) {
            if (n.subRows && n.subRows.length === 0) {
                delete n.subRows
            } else if (n.subRows) {
                prune(n.subRows)
            }
        }
    }

    prune(roots)
    return roots
}