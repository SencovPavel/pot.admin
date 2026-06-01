import { useState, useEffect, useMemo } from 'react'
import { fetchGroupDetail } from '@shared/api/api'

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

  const admins = useMemo(
    () => data?.members.filter(m => m.is_admin) ?? [],
    [data],
  )

  const regularMembers = useMemo(
    () => data?.members.filter(m => !m.is_admin) ?? [],
    [data],
  )

  return { data, error, loading, admins, regularMembers }
}
