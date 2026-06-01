import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchGroups } from '@shared/api/api'

type Group = Awaited<ReturnType<typeof fetchGroups>>[number]
export type SortKey = 'name' | 'created_at' | 'member_count' | 'event_count' | 'item_count' | 'last_activity'

export function useGroupsPageVM() {
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('last_activity')
  const [sortAsc, setSortAsc] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchGroups()
      .then(setGroups)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return groups.filter(g => !q || g.name.toLowerCase().includes(q) || g.id.includes(q))
  }, [groups, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av: number | string = a[sortKey] ?? ''
      const bv: number | string = b[sortKey] ?? ''
      if (typeof av === 'string' && typeof bv === 'string') {
        const cmp = av.localeCompare(bv, 'ru')
        return sortAsc ? cmp : -cmp
      }
      const cmp = (av as number) - (bv as number)
      return sortAsc ? cmp : -cmp
    })
  }, [filtered, sortKey, sortAsc])

  const handleSort = useCallback((key: SortKey) => {
    setSortKey(prev => {
      if (prev === key) { setSortAsc(a => !a); return prev }
      setSortAsc(false)
      return key
    })
  }, [])

  return {
    totalCount: groups.length,
    error, loading,
    sortKey, sortAsc,
    search, setSearch,
    sorted,
    handleSort,
  }
}
