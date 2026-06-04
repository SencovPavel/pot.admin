export type Page =
  | 'dashboard'
  | 'groups'
  | 'group-detail'
  | 'users'
  | 'user-detail'
  | 'events'
  | 'event-detail'
  | 'activity'
  | 'technical'
  | 'integrations'

export interface Me {
  id: string
  name: string
  email: string
  is_superadmin?: boolean
}

export interface Paginated<T> {
  rows: T[]
  total: number
  limit: number
  offset: number
}

export interface OverviewStats {
  totalGroups: number
  registeredUsers: number
  webUsers: number
  telegramUsers: number
  groupParticipants: number
  membersWithoutAccount: number
  totalUsers: number
  activeEvents: number
  totalItems: number
  dau: number
  wau: number
  activeToday: number
  activeWeek: number
  newGroupsWeek: number
  joinsWeek: number
  inactiveGroups30: number
  sparkline: Array<{ day: string; count: number }>
  platforms: Array<{ platform: string; count: number }>
}

export interface AdminGroupRow {
  id: string
  name: string
  emoji: string | null
  invite_code: string
  tg_chat_id: number | null
  max_chat_id: number | null
  created_at: string
  member_count: number
  event_count: number
  item_count: number
  last_activity: string | null
  days_since_activity: number | null
  bot_telegram: boolean
  bot_max: boolean
}

export interface ActivityRow {
  type: string
  label?: string
  user_id?: string | null
  platform?: string | null
  meta?: Record<string, unknown>
  created_at: string
}

export interface ProductActivityRow {
  type: string
  label: string
  actor_name: string | null
  data: Record<string, unknown>
  event_id: string | null
  created_at: string
}

export interface GroupDetailResponse {
  group: {
    id: string
    name: string
    emoji: string | null
    invite_code: string
    tg_chat_id: number | null
    max_chat_id: number | null
    created_at: string
    member_count: number
    event_count: number
    item_count: number
    items_total_sum: number
    bot_telegram: boolean
    bot_max: boolean
    events_by_status: Record<string, number>
    family_count: number
    archived_at?: string | null
  }
  creator: { user_id: string; name: string; joined_at: string } | null
  members: Array<{ user_id: string; name: string; joined_at: string; is_admin: boolean }>
  events: Array<{ id: string; name: string; event_date: string | null; status: string }>
  recentActivity: ActivityRow[]
  productActivity: ProductActivityRow[]
  topItems: Array<{ name: string; qty: number; unit: string; source: string; price: number; event_name: string | null }>
}

export interface AdminUserRow {
  id: string
  name: string
  email: string
  created_at: string
  is_superadmin: boolean
  groups_count: number
  last_seen_at: string | null
  is_telegram_stub: boolean
}

export interface FunnelStep {
  key: string
  label: string
  count: number
}
