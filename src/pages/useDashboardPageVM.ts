import { useState, useEffect, useMemo } from 'react'
import { fetchOverview } from '@shared/api/api'

type Overview = Awaited<ReturnType<typeof fetchOverview>>

function formatDay(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function useDashboardPageVM() {
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOverview()
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
  }, [])

  const sparklineData = useMemo(
    () => data?.sparkline.map(d => ({ day: formatDay(d.day), count: d.count })) ?? [],
    [data],
  )

  return { data, error, sparklineData }
}
