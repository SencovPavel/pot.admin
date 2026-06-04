import { useState, useEffect, useCallback } from 'react'
import { fetchUsers } from '@shared/api/api'
import type { AdminUserRow } from '@shared/types'

const PAGE_SIZE = 50

export function useUsersPageVM() {
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('')
  const [offset, setOffset] = useState(0)

  const load = useCallback(async (off: number, append: boolean) => {
    setLoading(true)
    try {
      const res = await fetchUsers({
        q: search.trim() || undefined,
        source: source || undefined,
        limit: PAGE_SIZE,
        offset: off,
      })
      setRows(prev => (append ? [...prev, ...res.rows] : res.rows))
      setTotal(res.total)
      setOffset(off)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }, [search, source])

  useEffect(() => { load(0, false) }, [load])

  return {
    rows, total, error, loading, search, setSearch, source, setSource,
    apply: () => load(0, false),
    loadMore: () => { if (rows.length < total) load(offset + PAGE_SIZE, true) },
    hasMore: rows.length < total,
  }
}
