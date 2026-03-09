import { useEffect, useMemo, useRef, useState } from 'react'
import type { Table } from '@tanstack/react-table'
import './ColumnsHeaderControl.css'
import { FIXED_HIDDEN_FROM_PICKER, MVP_COLUMN_IDS, REQUIRED_COLUMN_IDS } from './columnRegistry'

type Props = {
    table: Table<any>
}

type ColItem = {
    id: string
    label: string
    isVisible: boolean
    isRequired: boolean
}

function getColumnLabel(col: any): string {
    // Prefer a string header. If header is a function/component, fall back to id.
    const h = col.columnDef?.header
    if (typeof h === 'string') return h
    return col.id
}

export function ColumnsHeaderControl({ table }: Props) {
    const [open, setOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement | null>(null)

    // Close on outside click / Escape
    useEffect(() => {
        if (!open) return

        const onDocMouseDown = (e: MouseEvent) => {
            const target = e.target as Node
            if (rootRef.current && !rootRef.current.contains(target)) {
                setOpen(false)
            }
        }

        const onDocKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', onDocMouseDown)
        document.addEventListener('keydown', onDocKeyDown)
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown)
            document.removeEventListener('keydown', onDocKeyDown)
        }
    }, [open])

    const allPickable = useMemo(() => {
        const cols = table.getAllLeafColumns()
        return cols
            .filter(c => !FIXED_HIDDEN_FROM_PICKER.has(c.id))
            .map(c => ({
                id: c.id,
                label: getColumnLabel(c),
                isVisible: c.getIsVisible(),
                isRequired: REQUIRED_COLUMN_IDS.has(c.id),
            })) as ColItem[]
    }, [table, table.getState().columnVisibility])

    const mvpSet = useMemo(() => new Set(MVP_COLUMN_IDS), [])
    const mvpCols = allPickable.filter(c => mvpSet.has(c.id))
    const extraCols = allPickable.filter(c => !mvpSet.has(c.id))

    const setVisible = (id: string, next: boolean) => {
        if (REQUIRED_COLUMN_IDS.has(id) && next === false) return
        table.getColumn(id)?.toggleVisibility(next)
    }

    const showAll = () => {
        allPickable.forEach(c => setVisible(c.id, true))
    }

    const hideAdditional = () => {
        // Keep MVP visible; hide everything else except required
        extraCols.forEach(c => setVisible(c.id, false))
        mvpCols.forEach(c => setVisible(c.id, true))
    }

    const reset = () => {
        // Gentle reset: set MVP visible, additional hidden
        // (If you prefer “reset to current default”, we can change this later.)
        hideAdditional()
    }

    return (
        <div className="pcColCtl" ref={rootRef}>
            <button
                type="button"
                className="pcColCtl__btn"
                onClick={() => setOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                title="Columns"
            >
                Columns <span className="pcColCtl__chev">▾</span>
            </button>

            {open ? (
                <div className="pcColCtl__menu" role="menu" aria-label="Column options">
                    <div className="pcColCtl__menuTop">
                        <button type="button" className="pcColCtl__miniBtn" onClick={showAll}>
                            Show all
                        </button>
                        <button type="button" className="pcColCtl__miniBtn" onClick={hideAdditional}>
                            Hide additional
                        </button>
                        <button type="button" className="pcColCtl__miniBtn" onClick={reset}>
                            Reset
                        </button>
                    </div>

                    <div className="pcColCtl__section">
                        <div className="pcColCtl__sectionTitle">MVP columns</div>
                        {mvpCols.length === 0 ? (
                            <div className="pcColCtl__empty">No MVP columns found.</div>
                        ) : (
                            mvpCols.map(c => (
                                <label key={c.id} className="pcColCtl__item">
                                    <input
                                        type="checkbox"
                                        checked={c.isVisible}
                                        disabled={c.isRequired}
                                        onChange={e => setVisible(c.id, e.target.checked)}
                                    />
                                    <span className="pcColCtl__label">{c.label}</span>
                                </label>
                            ))
                        )}
                    </div>

                    <div className="pcColCtl__section">
                        <div className="pcColCtl__sectionTitle">Additional columns</div>
                        {extraCols.length === 0 ? (
                            <div className="pcColCtl__empty">No additional columns found.</div>
                        ) : (
                            extraCols.map(c => (
                                <label key={c.id} className="pcColCtl__item">
                                    <input
                                        type="checkbox"
                                        checked={c.isVisible}
                                        disabled={c.isRequired}
                                        onChange={e => setVisible(c.id, e.target.checked)}
                                    />
                                    <span className="pcColCtl__label">{c.label}</span>
                                </label>
                            ))
                        )}
                    </div>

                    <div className="pcColCtl__hint">
                        Tip: right-click header actions (insert left/right, rename) comes next.
                    </div>
                </div>
            ) : null}
        </div>
    )
}