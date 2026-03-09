export const FIXED_HIDDEN_FROM_PICKER = new Set(['drag', 'select', 'colActions'])

/**
 * MVP columns: ship-first / commonly expected columns for project operations.
 * You can tune this list without touching UI logic.
 */
export const MVP_COLUMN_IDS: string[] = [
    'taskId',
    'task',
    'resource',
    'start',
    'finish',
    'status',
    'priority',
    'percentComplete',
    'duration',
]

/**
 * Columns that should never be hidden (MVP).
 * Keep "task" always visible.
 */
export const REQUIRED_COLUMN_IDS = new Set(['task'])
