export type Page = 'dashboard' | 'groups' | 'group-detail' | 'activity' | 'technical'

export interface Me {
  id: string
  name: string
  email: string
  is_superadmin?: boolean
}
