import { useAppVM } from './useAppVM'
import { LoginPage } from '@pages/LoginPage'
import { DashboardPage } from '@pages/DashboardPage'
import { GroupsPage } from '@pages/GroupsPage'
import { GroupDetailPage } from '@pages/GroupDetailPage'
import { ActivityPage } from '@pages/ActivityPage'
import { TechnicalPage } from '@pages/TechnicalPage'
import type { Page } from '@shared/types'

const NAV: { id: Page; label: string }[] = [
  { id: 'dashboard',  label: 'Обзор' },
  { id: 'groups',     label: 'Группы' },
  { id: 'activity',   label: 'Активность' },
  { id: 'technical',  label: 'Технические' },
]

// nav item that should appear active for a given page
const NAV_ACTIVE: Partial<Record<Page, Page>> = {
  'group-detail': 'groups',
}

export default function App() {
  const { me, setMe, page, setPage, selectedGroupId, goToGroup, goBackToGroups, handleLogout } = useAppVM()

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
      return <GroupDetailPage groupId={selectedGroupId} onBack={goBackToGroups} />
    }
    if (page === 'groups') {
      return <GroupsPage onGroupClick={goToGroup} />
    }
    if (page === 'dashboard')  return <DashboardPage />
    if (page === 'activity')   return <ActivityPage />
    if (page === 'technical')  return <TechnicalPage />
    return null
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', height: 52,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', marginRight: 32, letterSpacing: '-0.02em' }}>
          🧺 Picnic Admin
        </span>
        <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: activeNavId === n.id ? '#f1f5f9' : 'transparent',
                color: activeNavId === n.id ? '#1e293b' : '#64748b',
                fontWeight: activeNavId === n.id ? 700 : 500,
                fontSize: 13, cursor: 'pointer', transition: 'all .15s',
              }}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <span style={{ fontSize: 12, color: '#94a3b8', marginRight: 12 }}>{me.email}</span>
        <button
          onClick={handleLogout}
          style={{
            padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: 'transparent', color: '#64748b', fontSize: 12, cursor: 'pointer',
          }}
        >
          Выйти
        </button>
      </header>

      <main style={{ flex: 1, padding: '28px 24px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {renderPage()}
      </main>
    </div>
  )
}
