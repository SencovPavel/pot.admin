import { useState, useEffect, useMemo } from 'react'
import { fetchTechnical } from '@shared/api/api'

type Technical = Awaited<ReturnType<typeof fetchTechnical>>

function fmtDay(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function useTechnicalPageVM() {
  const [data, setData] = useState<Technical | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTechnical()
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
      .finally(() => setLoading(false))
  }, [])

  const hourlyFull = useMemo(
    () => Array.from({ length: 24 }, (_, h) => {
      const found = data?.hourly.find(r => r.hour === h)
      return { hour: `${String(h).padStart(2, '0')}:00`, count: found?.count ?? 0 }
    }),
    [data],
  )

  const totalByDay = useMemo(
    () => data?.totalByDay.map(d => ({ day: fmtDay(d.day), count: d.count })) ?? [],
    [data],
  )

  return { data, error, loading, hourlyFull, totalByDay }
}
