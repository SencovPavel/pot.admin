import { useState, useEffect, useMemo } from 'react'
import { fetchActivity } from '@shared/api/api'

type Activity = Awaited<ReturnType<typeof fetchActivity>>

export const DAYS_OPTIONS = [7, 14, 30, 90] as const

function formatDay(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function useActivityPageVM() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Activity | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchActivity(days)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
      .finally(() => setLoading(false))
  }, [days])

  // Pivot: [{day, type1: n, type2: n, ...}]
  const byDayPivot = useMemo(() => {
    if (!data) return []
    const map = new Map<string, Record<string, string | number>>()
    for (const row of data.byDayType) {
      if (!map.has(row.day)) map.set(row.day, { day: formatDay(row.day) })
      map.get(row.day)![row.type] = row.count
    }
    return [...map.values()].sort((a, b) => String(a.day).localeCompare(String(b.day)))
  }, [data])

  // Pivot: [{day, telegram: n, web: n, ...}]
  const platformPivot = useMemo(() => {
    if (!data) return []
    const map = new Map<string, Record<string, string | number>>()
    for (const row of data.platforms) {
      if (!map.has(row.day)) map.set(row.day, { day: formatDay(row.day) })
      map.get(row.day)![row.platform] = row.count
    }
    return [...map.values()].sort((a, b) => String(a.day).localeCompare(String(b.day)))
  }, [data])

  const topTypes = useMemo(() => data?.topTypes ?? [], [data])

  const platformKeys = useMemo(
    () => [...new Set(data?.platforms.map(p => p.platform) ?? [])],
    [data],
  )

  const topTypeKeys = useMemo(() => topTypes.map(t => t.type), [topTypes])

  return {
    days, setDays,
    data, error, loading,
    byDayPivot, platformPivot,
    topTypes, platformKeys, topTypeKeys,
  }
}
