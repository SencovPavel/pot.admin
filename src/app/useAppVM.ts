import { useState, useEffect, useCallback } from 'react'
import { getMe, logout } from '@shared/api/api'
import type { Me, Page } from '@shared/types'

export type { Me, Page }

export function useAppVM() {
  const [me, setMe] = useState<Me | null | 'loading'>('loading')
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<{ groupId: string; eventId: string } | null>(null)

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe(null))
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    setMe(null)
  }, [])

  const goToGroup = useCallback((id: string) => {
    setSelectedGroupId(id)
    setSelectedUserId(null)
    setSelectedEvent(null)
    setPage('group-detail')
  }, [])

  const goToUser = useCallback((id: string) => {
    setSelectedUserId(id)
    setSelectedGroupId(null)
    setSelectedEvent(null)
    setPage('user-detail')
  }, [])

  const goToEvent = useCallback((groupId: string, eventId: string) => {
    setSelectedEvent({ groupId, eventId })
    setPage('event-detail')
  }, [])

  const goBackToGroups = useCallback(() => {
    setPage('groups')
    setSelectedGroupId(null)
  }, [])

  const goBackToUsers = useCallback(() => {
    setPage('users')
    setSelectedUserId(null)
  }, [])

  return {
    me,
    setMe,
    page,
    setPage,
    selectedGroupId,
    selectedUserId,
    selectedEvent,
    goToGroup,
    goToUser,
    goToEvent,
    goBackToGroups,
    goBackToUsers,
    handleLogout,
  }
}
