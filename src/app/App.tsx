import { useAppVM } from './useAppVM'
import { LoginPage } from '@pages/LoginPage'
import { DashboardPage } from '@pages/DashboardPage'
import { GroupsPage } from '@pages/GroupsPage'
import { GroupDetailPage } from '@pages/GroupDetailPage'
import { UsersPage } from '@pages/UsersPage'
import { UserDetailPage } from '@pages/UserDetailPage'
import { EventsPage } from '@pages/EventsPage'
import { EventDetailPage } from '@pages/EventDetailPage'
import { ActivityPage } from '@pages/ActivityPage'
import { TechnicalPage } from '@pages/TechnicalPage'
import { IntegrationsPage } from '@pages/IntegrationsPage'
import type { Page } from '@shared/types'

const NAV: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Обзор' },
  { id: 'groups', label: 'Группы' },
  { id: 'users', label: 'Пользователи' },
  { id: 'events', label: 'Мероприятия' },
  { id: 'activity', label: 'Активность' },
  { id: 'technical', label: 'Технические' },
  { id: 'integrations', label: 'Интеграции' },
]

const NAV_ACTIVE: Partial<Record<Page, Page>> = {
  'group-detail': 'groups',
  'user-detail': 'users',
  'event-detail': 'events',
}

export default function App() {
  const {
    me, setMe, page, setPage,
    selectedGroupId, selectedUserId, selectedEvent,
    goToGroup, goToUser, goToEvent,
    goBackToGroups, goBackToUsers,
    handleLogout,
  } = useAppVM()

  if (me === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>
        Загрузка…
      </div>
    )
  }

  if (!me || !me.is_superadmin) {
    return <LoginPage onLogin={setMe} />
  }

  const activeNavId = NAV_ACTIVE[page] ?? page

  function renderPage() {
    if (page === 'group-detail' && selectedGroupId) {
      return (
        <GroupDetailPage
          groupId={selectedGroupId}
          onBack={goBackToGroups}
          onUserClick={goToUser}
          onEventClick={goToEvent}
        />
      )
    }
    if (page === 'user-detail' && selectedUserId) {
      return (
        <UserDetailPage
          userId={selectedUserId}
          onBack={goBackToUsers}
          onGroupClick={goToGroup}
        />
      )
    }
    if (page === 'event-detail' && selectedEvent) {
      return (
        <EventDetailPage
          groupId={selectedEvent.groupId}
          eventId={selectedEvent.eventId}
          onBack={() => setPage('events')}
        />
      )
    }
    if (page === 'groups') return <GroupsPage onGroupClick={goToGroup} />
    if (page === 'users') return <UsersPage onUserClick={goToUser} />
    if (page === 'events') return <EventsPage onEventClick={goToEvent} />
    if (page === 'dashboard') return <DashboardPage />
    if (page === 'activity') return <ActivityPage />
    if (page === 'technical') return <TechnicalPage />
    if (page === 'integrations') return <IntegrationsPage />
    return null
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
      }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', marginBottom: 20, padding: '0 8px' }}>
          Котёл Admin
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {NAV.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => setPage(n.id)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                textAlign: 'left',
                background: activeNavId === n.id ? '#f1f5f9' : 'transparent',
                color: activeNavId === n.id ? '#1e293b' : '#64748b',
                fontWeight: activeNavId === n.id ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '8px', borderTop: '1px solid #f1f5f9', marginTop: 8 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.email}</div>
          <button type="button" onClick={handleLogout} style={{
            width: '100%', padding: '6px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: 'transparent', color: '#64748b', fontSize: 12, cursor: 'pointer',
          }}>
            Выйти
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1100, boxSizing: 'border-box' }}>
        {renderPage()}
      </main>
    </div>
  )
}
