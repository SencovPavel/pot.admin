import { useState, useEffect, useCallback } from 'react'
import { fetchGroups } from '@shared/api/api'
import type { AdminGroupRow } from '@shared/types'

export type SortKey = 'name' | 'created_at' | 'member_count' | 'event_count' | 'item_count' | 'last_activity' | 'days_since_activity'

const PAGE_SIZE = 50

export function useGroupsPageVM() {
  const [rows, setRows] = useState<AdminGroupRow[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [inactiveDays, setInactiveDays] = useState<number | ''>('')
  const [hasBotOnly, setHasBotOnly] = useState(false)
  const [offset, setOffset] = useState(0)

  const load = useCallback(async (off: number, append: boolean) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchGroups({
        q: search.trim() || undefined,
        inactiveDays: inactiveDays === '' ? undefined : Number(inactiveDays),
        hasBot: hasBotOnly || undefined,
        limit: PAGE_SIZE,
        offset: off,
      })
      setRows(prev => (append ? [...prev, ...res.rows] : res.rows))
      setTotal(res.total)
      setOffset(off)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }, [search, inactiveDays, hasBotOnly])

  useEffect(() => {
    load(0, false)
  }, [load])

  const applyFilters = useCallback(() => {
    load(0, false)
  }, [load])

  const loadMore = useCallback(() => {
    if (rows.length < total) load(offset + PAGE_SIZE, true)
  }, [load, rows.length, total, offset])

  return {
    rows,
    total,
    error,
    loading,
    search,
    setSearch,
    inactiveDays,
    setInactiveDays,
    hasBotOnly,
    setHasBotOnly,
    applyFilters,
    loadMore,
    hasMore: rows.length < total,
  }
}
