import { useState, useEffect, useCallback } from 'react'
import { getMe, logout } from '@shared/api/api'
import type { Me, Page } from '@shared/types'

export type { Me, Page }

export function useAppVM() {
  const [me, setMe] = useState<Me | null | 'loading'>('loading')
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe(null))
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    setMe(null)
  }, [])

  const goToGroup = useCallback((id: string) => {
    setSelectedGroupId(id)
    setPage('group-detail')
  }, [])

  const goBackToGroups = useCallback(() => {
    setPage('groups')
    setSelectedGroupId(null)
  }, [])

  return { me, setMe, page, setPage, selectedGroupId, goToGroup, goBackToGroups, handleLogout }
}
