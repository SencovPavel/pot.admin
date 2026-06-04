import { useState, useEffect, useMemo } from 'react'
import { fetchGroupDetail } from '@shared/api/api'
import { ensureArray } from '@shared/lib/ensure-array'

type Detail = Awaited<ReturnType<typeof fetchGroupDetail>>

export function useGroupDetailPageVM(groupId: string) {
  const [data, setData] = useState<Detail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError('')
    setData(null)
    fetchGroupDetail(groupId)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
      .finally(() => setLoading(false))
  }, [groupId])

  const members = useMemo(
    () => ensureArray<NonNullable<Detail>['members'][number]>(data?.members),
    [data],
  )

  const admins = useMemo(
    () => members.filter(m => m.is_admin),
    [members],
  )

  const regularMembers = useMemo(
    () => members.filter(m => !m.is_admin),
    [members],
  )

  const reload = () => {
    setLoading(true)
    fetchGroupDetail(groupId)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
      .finally(() => setLoading(false))
  }

  return { data, error, loading, admins, regularMembers, reload }
}
