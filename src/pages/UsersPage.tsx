import { fmtDateMsk } from '@shared/lib/format'
import { useUsersPageVM } from './useUsersPageVM'

interface Props {
  onUserClick: (id: string) => void
}

export function UsersPage({ onUserClick }: Props) {
  const { rows, total, error, loading, search, setSearch, source, setSource, apply, loadMore, hasMore } = useUsersPageVM()

  if (error) return <div style={{ color: '#dc2626' }}>Ошибка: {error}</div>

  return (
    <div>
      <h1 style={h1}>Пользователи</h1>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>{total} аккаунтов в users</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="id, email, имя…" style={input} onKeyDown={e => e.key === 'Enter' && apply()} />
        <select value={source} onChange={e => setSource(e.target.value)} style={input}>
          <option value="">Все</option>
          <option value="web">Web</option>
          <option value="telegram">Telegram</option>
        </select>
        <button type="button" onClick={apply} style={btn}>Найти</button>
      </div>

      <div style={wrap}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={th}>Пользователь</th>
              <th style={th}>Email</th>
              <th style={thR}>Групп</th>
              <th style={th}>Последний визит</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u, i) => (
              <tr key={u.id} onClick={() => onUserClick(u.id)} style={{ cursor: 'pointer', background: i % 2 ? '#fafafa' : '#fff' }}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{u.name}{u.is_superadmin ? ' 🛡' : ''}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.id}{u.is_telegram_stub ? ' · TG' : ''}</div>
                </td>
                <td style={td}>{u.email}</td>
                <td style={tdR}>{u.groups_count}</td>
                <td style={td}>{fmtDateMsk(u.last_seen_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && <button type="button" onClick={loadMore} style={{ ...btn, marginTop: 12 }} disabled={loading}>Ещё</button>}
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 8 }
const wrap: React.CSSProperties = { background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 700 }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 14px' }
const tdR: React.CSSProperties = { ...td, textAlign: 'right', fontWeight: 600 }
const input: React.CSSProperties = { padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }
const btn: React.CSSProperties = { padding: '7px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }
