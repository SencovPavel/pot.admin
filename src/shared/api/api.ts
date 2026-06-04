import type {
  OverviewStats,
  Paginated,
  AdminGroupRow,
  GroupDetailResponse,
  AdminUserRow,
  FunnelStep,
  ProductActivityRow,
} from '../types'

const fetch_ = (path: string, init?: RequestInit) =>
  fetch(path, { credentials: 'include', ...init })

async function json<T>(r: Promise<Response>): Promise<T> {
  const res = await r
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const r = await fetch_('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await r.json() as { error?: string; is_superadmin?: boolean }
  if (!r.ok) throw new Error(data.error ?? 'Ошибка входа')
  return data
}

export async function logout() {
  await fetch_('/auth/logout', { method: 'POST' })
}

/** Локальный вход без пароля (только NODE_ENV !== production на бэкенде). */
export async function devLogin() {
  const r = await fetch_('/auth/dev-login', { method: 'POST' })
  const data = await r.json() as { error?: string; is_superadmin?: boolean; id: string; name: string; email: string }
  if (!r.ok) throw new Error(data.error ?? 'dev-login недоступен')
  return data
}

export async function getMe() {
  const r = await fetch_('/auth/me')
  if (!r.ok) return null
  return r.json() as Promise<{ id: string; name: string; email: string; is_superadmin?: boolean }>
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function fetchOverview() {
  return json<OverviewStats>(fetch_('/admin/stats/overview'))
}

export function fetchGroups(params: {
  q?: string
  inactiveDays?: number
  hasBot?: boolean
  limit?: number
  offset?: number
}) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.inactiveDays != null) sp.set('inactiveDays', String(params.inactiveDays))
  if (params.hasBot) sp.set('hasBot', '1')
  if (params.limit != null) sp.set('limit', String(params.limit))
  if (params.offset != null) sp.set('offset', String(params.offset))
  const qs = sp.toString()
  return json<Paginated<AdminGroupRow>>(fetch_( `/admin/stats/groups${qs ? `?${qs}` : ''}`))
}

export function fetchGroupDetail(groupId: string) {
  return json<GroupDetailResponse>(
    fetch_(`/admin/stats/groups/${encodeURIComponent(groupId)}`),
  )
}

export function fetchActivity(days = 30) {
  return json<{
    byDayType: Array<{ day: string; type: string; count: number }>
    topTypes: Array<{ type: string; label: string; count: number }>
    platforms: Array<{ platform: string; day: string; count: number }>
    days: number
  }>(fetch_(`/admin/stats/activity?days=${days}`))
}

export function fetchTechnical() {
  return json<{
    hourly: Array<{ hour: number; count: number }>
    topTypes: Array<{ type: string; label: string; count: number }>
    errors: Array<{ id: number; type: string; label?: string; user_id: string | null; group_id: string | null; meta: Record<string, unknown>; created_at: string }>
    totalByDay: Array<{ day: string; count: number }>
  }>(fetch_('/admin/stats/technical'))
}

export function fetchFunnel(days = 30) {
  return json<{ days: number; steps: FunnelStep[] }>(fetch_(`/admin/stats/funnel?days=${days}`))
}

export function fetchRetention() {
  return json<{
    cohortSize: number
    d7: { count: number; pct: number }
    d14: { count: number; pct: number }
    d30: { count: number; pct: number }
  }>(fetch_('/admin/stats/retention'))
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function fetchUsers(params: { q?: string; source?: string; superadmin?: boolean; limit?: number; offset?: number }) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.source) sp.set('source', params.source)
  if (params.superadmin) sp.set('superadmin', '1')
  if (params.limit != null) sp.set('limit', String(params.limit))
  if (params.offset != null) sp.set('offset', String(params.offset))
  return json<Paginated<AdminUserRow>>(fetch_(`/admin/users?${sp}`))
}

export function fetchUserDetail(id: string) {
  return json<{
    user: AdminUserRow & { bio?: string | null; is_telegram_stub: boolean }
    oauth: Array<{ provider: string; provider_id: string; email: string | null }>
    groups: Array<{ id: string; name: string; emoji: string | null; is_admin: boolean; joined_at: string }>
    family: Array<{ id: string; name: string; label: string | null }>
    recentActivity: Array<{ type: string; label: string; group_id: string | null; created_at: string }>
  }>(fetch_(`/admin/users/${encodeURIComponent(id)}`))
}

export function patchUserSuperadmin(id: string, is_superadmin: boolean) {
  return json<{ ok: boolean }>(fetch_(`/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_superadmin }),
  }))
}

// ── Events ────────────────────────────────────────────────────────────────────

export function fetchEvents(params: { status?: string; groupId?: string; limit?: number; offset?: number }) {
  const sp = new URLSearchParams()
  if (params.status) sp.set('status', params.status)
  if (params.groupId) sp.set('groupId', params.groupId)
  if (params.limit != null) sp.set('limit', String(params.limit))
  if (params.offset != null) sp.set('offset', String(params.offset))
  return json<Paginated<{
    id: string
    group_id: string
    group_name: string
    name: string
    event_date: string | null
    status: string
    items_count: number
    rsvp_count: number
  }>>(fetch_(`/admin/events?${sp}`))
}

export function fetchEventDetail(groupId: string, eventId: string) {
  return json<{
    event: { id: string; name: string; status: string; event_date: string | null; group_name: string }
    items: Array<{ id: string; name: string; qty: number; unit: string; price: number; source: string; bought: boolean }>
    itemsTotalSum: number
    boughtPct: number
    rsvp: Array<{ user_id: string; attending: boolean; name: string | null }>
    familyRsvp: Array<{ family_member_id: string; attending: boolean; name: string }>
    activity: ProductActivityRow[]
  }>(fetch_(
    `/admin/stats/groups/${encodeURIComponent(groupId)}/events/${encodeURIComponent(eventId)}`,
  ))
}

// ── Integrations & health ─────────────────────────────────────────────────────

export function fetchIntegrations() {
  return json<{
    telegramLinked: Array<{ id: string; name: string; tg_chat_id: number; messages_7d: number }>
    noBot: Array<{ id: string; name: string; member_count: number }>
    maxLinked: Array<{ id: string; name: string; max_chat_id: number }>
    chatMessages7d: number | null
  }>(fetch_('/admin/integrations'))
}

export function fetchHealth() {
  return json<{
    nodeEnv: string
    uptimeSec: number
    botConfigured: boolean
    publicUrl: string | null
    errors24h: Array<{ type: string; count: number }>
    errors7d: Array<{ type: string; count: number }>
    tableSizes: Array<{ table_name: string; size_bytes: string }>
  }>(fetch_('/admin/health'))
}

export function archiveGroup(groupId: string) {
  return json<{ ok: boolean }>(fetch_(`/admin/groups/${encodeURIComponent(groupId)}/archive`, {
    method: 'POST',
  }))
}

export function fetchAuditLog() {
  return json<Array<{
    id: number
    actor_id: string
    action: string
    target_type: string
    target_id: string
    created_at: string
  }>>(fetch_('/admin/audit-log'))
}

export function exportGroupsCsvUrl(params: { q?: string; hasBot?: boolean }) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.hasBot) sp.set('hasBot', '1')
  const qs = sp.toString()
  return `/admin/export/groups.csv${qs ? `?${qs}` : ''}`
}

export function exportAnalyticsCsvUrl(days: number) {
  return `/admin/export/analytics.csv?days=${days}`
}
