import { useState, useEffect } from 'react'
import { getMe, logout } from './api'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { GroupsPage } from './pages/GroupsPage'
import { ActivityPage } from './pages/ActivityPage'
import { TechnicalPage } from './pages/TechnicalPage'

type Page = 'dashboard' | 'groups' | 'activity' | 'technical'

interface Me { id: string; name: string; email: string; is_superadmin?: boolean }

const NAV: { id: Page; label: string }[] = [
  { id: 'dashboard',  label: 'Обзор' },
  { id: 'groups',     label: 'Группы' },
  { id: 'activity',   label: 'Активность' },
  { id: 'technical',  label: 'Технические' },
]

export default function App() {
  const [me, setMe] = useState<Me | null | 'loading'>('loading')
  const [page, setPage] = useState<Page>('dashboard')

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe(null))
  }, [])

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

  const handleLogout = async () => {
    await logout()
    setMe(null)
  }

  const PageComponent = {
    dashboard:  DashboardPage,
    groups:     GroupsPage,
    activity:   ActivityPage,
    technical:  TechnicalPage,
  }[page]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '0 24px',
        height: 52,
        position: 'sticky',
        top: 0,
        zIndex: 10,
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
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: page === n.id ? '#f1f5f9' : 'transparent',
                color: page === n.id ? '#1e293b' : '#64748b',
                fontWeight: page === n.id ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all .15s',
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

      {/* Page content */}
      <main style={{ flex: 1, padding: '28px 24px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <PageComponent />
      </main>
    </div>
  )
}
