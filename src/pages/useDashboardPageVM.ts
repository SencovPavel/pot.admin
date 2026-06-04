import { useState, useEffect, useMemo } from 'react'
import { fetchOverview, fetchFunnel, fetchRetention } from '@shared/api/api'
import type { OverviewStats, FunnelStep } from '@shared/types'

function formatDay(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow', day: '2-digit', month: '2-digit' })
}

export function useDashboardPageVM() {
  const [data, setData] = useState<OverviewStats | null>(null)
  const [funnel, setFunnel] = useState<FunnelStep[]>([])
  const [retention, setRetention] = useState<{
    cohortSize: number
    d7: { count: number; pct: number }
    d14: { count: number; pct: number }
    d30: { count: number; pct: number }
  } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchOverview(), fetchFunnel(30), fetchRetention()])
      .then(([ov, fn, ret]) => {
        setData(ov)
        setFunnel(fn.steps)
        setRetention(ret)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
  }, [])

  const sparklineData = useMemo(
    () => data?.sparkline.map(d => ({ day: formatDay(d.day), count: d.count })) ?? [],
    [data],
  )

  return { data, error, sparklineData, funnel, retention }
}
