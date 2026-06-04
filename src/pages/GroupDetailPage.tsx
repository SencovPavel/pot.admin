import { useState } from 'react'
import { BotBadge } from '@shared/components/BotBadge'
import { JsonDetails } from '@shared/components/JsonDetails'
import { fmtDateMsk, fmtDateShortMsk, fmtNum } from '@shared/lib/format'
import { archiveGroup } from '@shared/api/api'
import { useGroupDetailPageVM } from './useGroupDetailPageVM'

interface Props {
  groupId: string
  onBack: () => void
  onUserClick?: (userId: string) => void
  onEventClick?: (groupId: string, eventId: string) => void
}

type Tab = 'summary' | 'members' | 'events' | 'activity' | 'items'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active: { label: 'Активно', color: '#10b981' },
  completed: { label: 'Завершено', color: '#94a3b8' },
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'summary', label: 'Сводка' },
  { id: 'members', label: 'Участники' },
  { id: 'events', label: 'События' },
  { id: 'activity', label: 'Активность' },
  { id: 'items', label: 'Товары' },
]

export function GroupDetailPage({ groupId, onBack, onUserClick, onEventClick }: Props) {
  const { data, error, loading, admins, regularMembers, reload } = useGroupDetailPageVM(groupId)
  const [tab, setTab] = useState<Tab>('summary')
  const [archiving, setArchiving] = useState(false)

  if (error) return <div style={{ color: '#dc2626', fontSize: 14 }}>Ошибка: {error}</div>
  if (loading) return <div style={{ color: '#94a3b8', fontSize: 14 }}>Загрузка…</div>
  if (!data) return null

  const { group, creator, events, recentActivity, productActivity, topItems } = data

  const handleArchive = async () => {
    if (!confirm(`Архивировать группу «${group.name}»?`)) return
    setArchiving(true)
    try {
      await archiveGroup(groupId)
      reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setArchiving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" onClick={onBack} style={backBtn}>← Группы</button>
        {group.emoji && <span style={{ fontSize: 22 }}>{group.emoji}</span>}
        <h1 style={h1}>{group.name}</h1>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{group.id}</span>
        {!group.archived_at && (
          <button type="button" onClick={handleArchive} disabled={archiving} style={archiveBtn}>
            {archiving ? '…' : 'Архивировать'}
          </button>
        )}
        {group.archived_at && (
          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>В архиве</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: tab === t.id ? '#6366f1' : '#f1f5f9',
              color: tab === t.id ? '#fff' : '#64748b',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <MetaChip label="Создана" value={fmtDateShortMsk(group.created_at)} />
          <MetaChip label="Участников" value={String(group.member_count)} />
          <MetaChip label="Мероприятий" value={String(group.event_count)} />
          <MetaChip label="Товаров" value={String(group.item_count)} />
          <MetaChip label="Сумма списка" value={`${fmtNum(Math.round(group.items_total_sum))} ₽`} />
          <MetaChip label="Семья (записей)" value={String(group.family_count)} />
          <MetaChip label="Код" value={group.invite_code} mono />
          <MetaChip label="Бот" value="" extra={<BotBadge telegram={group.bot_telegram} max={group.bot_max} />} />
          {group.tg_chat_id != null && <MetaChip label="TG Chat" value={String(group.tg_chat_id)} mono />}
          {Object.entries(group.events_by_status || {}).map(([st, n]) => (
            <MetaChip key={st} label={`События: ${st}`} value={String(n)} />
          ))}
        </div>
      )}

      {tab === 'members' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {creator && (
            <div style={card}>
              <div style={cardTitle}>Создатель</div>
              <MemberRow m={creator} onUserClick={onUserClick} showAdmin />
            </div>
          )}
          <div style={card}>
            <div style={cardTitle}>Админы ({admins.length})</div>
            {admins.map(m => <MemberRow key={m.user_id} m={m} onUserClick={onUserClick} showAdmin />)}
          </div>
          <div style={{ ...card, gridColumn: '1 / -1' }}>
            <div style={cardTitle}>Участники ({regularMembers.length})</div>
            {regularMembers.length === 0
              ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Нет</div>
              : regularMembers.map(m => <MemberRow key={m.user_id} m={m} onUserClick={onUserClick} />)}
          </div>
        </div>
      )}

      {tab === 'events' && (
        <div style={card}>
          {events.length === 0
            ? <div style={{ color: '#94a3b8' }}>Нет мероприятий</div>
            : events.map(e => {
              const s = STATUS_LABEL[e.status] ?? { label: e.status, color: '#94a3b8' }
              return (
                <div
                  key={e.id}
                  role={onEventClick ? 'button' : undefined}
                  onClick={() => onEventClick?.(groupId, e.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: onEventClick ? 'pointer' : 'default',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{e.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDateMsk(e.event_date)} · {e.id}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
                </div>
              )
            })}
        </div>
      )}

      {tab === 'activity' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={card}>
            <div style={cardTitle}>Продуктовая лента (group_activity)</div>
            {productActivity.length === 0
              ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Нет</div>
              : productActivity.map((a, i) => (
                <div key={i} style={activityRow}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#6366f1' }}>{a.label}</span>
                    {a.actor_name && <span style={{ color: '#64748b', marginLeft: 8 }}>{a.actor_name}</span>}
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{fmtDateMsk(a.created_at)}</div>
                    <JsonDetails data={a.data} />
                  </div>
                </div>
              ))}
          </div>
          <div style={card}>
            <div style={cardTitle}>Analytics</div>
            {recentActivity.length === 0
              ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Нет</div>
              : recentActivity.map((a, i) => (
                <div key={i} style={activityRow}>
                  <span style={{ fontWeight: 700, color: '#6366f1' }}>{a.label ?? a.type}</span>
                  {a.platform && <span style={pill}>{a.platform}</span>}
                  {a.user_id && onUserClick ? (
                    <button type="button" onClick={() => onUserClick(a.user_id!)} style={linkBtn}>{a.user_id}</button>
                  ) : a.user_id ? (
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{a.user_id}</span>
                  ) : null}
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{fmtDateMsk(a.created_at)}</div>
                  <JsonDetails data={a.meta} />
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === 'items' && (
        <div style={card}>
          <div style={cardTitle}>Топ позиций</div>
          {topItems.length === 0
            ? <div style={{ color: '#94a3b8' }}>Нет товаров</div>
            : (
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={thL}>Название</th>
                    <th style={thR}>Кол-во</th>
                    <th style={thR}>Цена</th>
                    <th style={thL}>Источник</th>
                    <th style={thL}>Событие</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((it, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={tdL}>{it.name}</td>
                      <td style={tdR}>{it.qty} {it.unit}</td>
                      <td style={tdR}>{it.price}</td>
                      <td style={tdL}>{it.source}</td>
                      <td style={tdL}>{it.event_name ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      )}
    </div>
  )
}

function MemberRow({ m, onUserClick, showAdmin }: {
  m: { user_id: string; name: string; joined_at: string; is_admin?: boolean }
  onUserClick?: (id: string) => void
  showAdmin?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}{showAdmin || m.is_admin ? ' ★' : ''}</div>
        {onUserClick ? (
          <button type="button" onClick={() => onUserClick(m.user_id)} style={linkBtn}>{m.user_id}</button>
        ) : (
          <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.user_id}</div>
        )}
      </div>
      <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtDateShortMsk(m.joined_at)}</span>
    </div>
  )
}

function MetaChip({ label, value, mono, extra }: {
  label: string
  value: string
  mono?: boolean
  extra?: React.ReactNode
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '8px 14px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      {extra ?? (
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
      )}
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }
const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const cardTitle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }
const backBtn: React.CSSProperties = { padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontSize: 12, cursor: 'pointer' }
const archiveBtn: React.CSSProperties = { padding: '5px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, cursor: 'pointer', marginLeft: 'auto' }
const activityRow: React.CSSProperties = { padding: '8px 0', borderBottom: '1px solid #f1f5f9' }
const pill: React.CSSProperties = { fontSize: 10, background: '#f1f5f9', padding: '1px 6px', borderRadius: 10, marginLeft: 6 }
const linkBtn: React.CSSProperties = { fontSize: 10, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }
const thL: React.CSSProperties = { textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 700 }
const thR: React.CSSProperties = { ...thL, textAlign: 'right' }
const tdL: React.CSSProperties = { padding: '6px 8px', textAlign: 'left' }
const tdR: React.CSSProperties = { ...tdL, textAlign: 'right', fontWeight: 600 }
