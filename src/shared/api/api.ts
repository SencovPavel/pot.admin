const fetch_ = (path: string, init?: RequestInit) =>
  fetch(path, { credentials: 'include', ...init })

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const r = await fetch_('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.error ?? 'Ошибка входа')
  return data as { id: string; name: string; email: string; is_superadmin?: boolean }
}

export async function logout() {
  await fetch_('/auth/logout', { method: 'POST' })
}

export async function getMe() {
  const r = await fetch_('/auth/me')
  if (!r.ok) return null
  return r.json() as Promise<{ id: string; name: string; email: string; is_superadmin?: boolean }>
}

// ── Admin stats ───────────────────────────────────────────────────────────────

export async function fetchOverview() {
  const r = await fetch_('/admin/stats/overview')
  if (!r.ok) throw new Error('forbidden')
  return r.json() as Promise<{
    totalGroups: number
    totalUsers: number
    activeEvents: number
    totalItems: number
    activeToday: number
    activeWeek: number
    newGroupsWeek: number
    sparkline: Array<{ day: string; count: number }>
    platforms: Array<{ platform: string; count: number }>
  }>
}

export async function fetchGroups() {
  const r = await fetch_('/admin/stats/groups')
  if (!r.ok) throw new Error('forbidden')
  return r.json() as Promise<Array<{
    id: string
    name: string
    created_at: string
    member_count: number
    event_count: number
    item_count: number
    last_activity: string | null
  }>>
}

export async function fetchActivity(days = 30) {
  const r = await fetch_(`/admin/stats/activity?days=${days}`)
  if (!r.ok) throw new Error('forbidden')
  return r.json() as Promise<{
    byDayType: Array<{ day: string; type: string; count: number }>
    topTypes: Array<{ type: string; count: number }>
    platforms: Array<{ platform: string; day: string; count: number }>
    days: number
  }>
}

export async function fetchGroupDetail(groupId: string) {
  const r = await fetch_(`/admin/stats/groups/${encodeURIComponent(groupId)}`)
  if (!r.ok) throw new Error('forbidden')
  return r.json() as Promise<{
    group: { id: string; name: string; invite_code: string; tg_chat_id: number | null; created_at: string; member_count: number; event_count: number; item_count: number }
    creator: { user_id: string; name: string; joined_at: string } | null
    members: Array<{ user_id: string; name: string; joined_at: string; is_admin: boolean }>
    events: Array<{ id: string; name: string; event_date: string; status: string }>
    recentActivity: Array<{ type: string; user_id: string | null; platform: string | null; created_at: string }>
  }>
}

export async function fetchTechnical() {
  const r = await fetch_('/admin/stats/technical')
  if (!r.ok) throw new Error('forbidden')
  return r.json() as Promise<{
    hourly: Array<{ hour: number; count: number }>
    topTypes: Array<{ type: string; count: number }>
    errors: Array<{ id: number; type: string; user_id: string | null; group_id: string | null; meta: Record<string, unknown>; created_at: string }>
    totalByDay: Array<{ day: string; count: number }>
  }>
}
