import { BotBadge } from '@shared/components/BotBadge'
import { fmtDateMsk } from '@shared/lib/format'
import { exportGroupsCsvUrl } from '@shared/api/api'
import { useGroupsPageVM } from './useGroupsPageVM'

interface Props {
  onGroupClick: (id: string) => void
}

export function GroupsPage({ onGroupClick }: Props) {
  const {
    rows, total, error, loading,
    search, setSearch, inactiveDays, setInactiveDays,
    hasBotOnly, setHasBotOnly, applyFilters, loadMore, hasMore,
  } = useGroupsPageVM()

  if (error) return <div style={{ color: '#dc2626', fontSize: 14 }}>Ошибка: {error}</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={h1}>Группы</h1>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{total} всего</span>
        <div style={{ flex: 1 }} />
        <a
          href={exportGroupsCsvUrl({ q: search.trim() || undefined, hasBot: hasBotOnly })}
          style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}
        >
          CSV
        </a>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') applyFilters() }}
          placeholder="Название, id, код, TG chat…"
          style={inputStyle}
        />
        <input
          type="number"
          min={0}
          value={inactiveDays}
          onChange={e => setInactiveDays(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Дней без активности"
          style={{ ...inputStyle, width: 160 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
          <input type="checkbox" checked={hasBotOnly} onChange={e => setHasBotOnly(e.target.checked)} />
          Только с ботом
        </label>
        <button type="button" onClick={applyFilters} style={btnPrimary}>Найти</button>
      </div>

      {loading && rows.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Загрузка…</div>
      ) : (
        <div style={tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={th}>Группа</th>
                <th style={th}>Бот</th>
                <th style={thR}>Участн.</th>
                <th style={thR}>События</th>
                <th style={thR}>Товары</th>
                <th style={thR}>Без акт.</th>
                <th style={th}>Последняя акт.</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Ничего не найдено</td></tr>
              ) : rows.map((g, i) => (
                <tr
                  key={g.id}
                  onClick={() => onGroupClick(g.id)}
                  style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa', cursor: 'pointer' }}
                >
                  <td style={tdL}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {g.emoji && <span>{g.emoji}</span>}
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{g.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{g.id} · {g.invite_code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdL}><BotBadge telegram={g.bot_telegram} max={g.bot_max} /></td>
                  <td style={tdR}>{g.member_count}</td>
                  <td style={tdR}>{g.event_count}</td>
                  <td style={tdR}>{g.item_count}</td>
                  <td style={tdR}>{g.days_since_activity ?? '—'}</td>
                  <td style={tdL}>{fmtDateMsk(g.last_activity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && (
        <button type="button" onClick={loadMore} disabled={loading} style={{ ...btnPrimary, marginTop: 12 }}>
          {loading ? 'Загрузка…' : 'Загрузить ещё'}
        </button>
      )}
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', margin: 0 }
const tableWrap: React.CSSProperties = { background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }
const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const tdL: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', verticalAlign: 'middle' }
const tdR: React.CSSProperties = { ...tdL, textAlign: 'right', fontWeight: 600 }
const inputStyle: React.CSSProperties = { padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#1e293b', outline: 'none', width: 240 }
const btnPrimary: React.CSSProperties = { padding: '7px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
