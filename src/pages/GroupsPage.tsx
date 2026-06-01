import { useState, useEffect, useMemo } from 'react'
import { fetchGroups } from '../api'

type Group = Awaited<ReturnType<typeof fetchGroups>>[number]
type SortKey = 'name' | 'created_at' | 'member_count' | 'event_count' | 'item_count' | 'last_activity'

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('last_activity')
  const [sortAsc, setSortAsc] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchGroups()
      .then(setGroups)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return groups.filter(g => !q || g.name.toLowerCase().includes(q) || g.id.includes(q))
  }, [groups, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: number | string = a[sortKey] ?? ''
      let bv: number | string = b[sortKey] ?? ''
      if (typeof av === 'string' && typeof bv === 'string') {
        const cmp = av.localeCompare(bv, 'ru')
        return sortAsc ? cmp : -cmp
      }
      const cmp = (av as number) - (bv as number)
      return sortAsc ? cmp : -cmp
    })
  }, [filtered, sortKey, sortAsc])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  if (error) return <div style={{ color: '#dc2626', fontSize: 14 }}>Ошибка: {error}</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <h1 style={h1}>Группы</h1>
        <span style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{groups.length} всего</span>
        <div style={{ flex: 1 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по названию…"
          style={{
            padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
            fontSize: 13, color: '#1e293b', outline: 'none', width: 220,
          }}
        />
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Загрузка…</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {COLS.map(c => (
                  <th
                    key={c.key}
                    onClick={() => handleSort(c.key as SortKey)}
                    style={{
                      padding: '10px 14px', textAlign: c.right ? 'right' : 'left',
                      fontWeight: 700, color: '#64748b', fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                    }}
                  >
                    {c.label}
                    {sortKey === c.key && <span style={{ marginLeft: 4 }}>{sortAsc ? '↑' : '↓'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                    Ничего не найдено
                  </td>
                </tr>
              ) : sorted.map((g, i) => (
                <tr
                  key={g.id}
                  style={{
                    borderBottom: i < sorted.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: i % 2 === 0 ? '#fff' : '#fafafa',
                  }}
                >
                  <td style={tdL}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{g.id}</div>
                  </td>
                  <td style={tdR}>{g.member_count}</td>
                  <td style={tdR}>{g.event_count}</td>
                  <td style={tdR}>{g.item_count}</td>
                  <td style={tdL}>{fmtDate(g.created_at)}</td>
                  <td style={tdL}>{g.last_activity ? fmtDate(g.last_activity) : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const COLS = [
  { key: 'name',          label: 'Название',        right: false },
  { key: 'member_count',  label: 'Участники',       right: true  },
  { key: 'event_count',   label: 'Мероприятия',     right: true  },
  { key: 'item_count',    label: 'Товары',          right: true  },
  { key: 'created_at',    label: 'Создана',         right: false },
  { key: 'last_activity', label: 'Последняя акт.',  right: false },
]

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const h1: React.CSSProperties = {
  fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em',
}
const tdL: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', verticalAlign: 'middle' }
const tdR: React.CSSProperties = { padding: '10px 14px', textAlign: 'right', verticalAlign: 'middle', color: '#1e293b', fontWeight: 600 }
