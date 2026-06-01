import { useGroupDetailPageVM } from './useGroupDetailPageVM'

interface Props {
  groupId: string
  onBack: () => void
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:   { label: 'Активно',   color: '#10b981' },
  archived: { label: 'Архив',     color: '#94a3b8' },
  draft:    { label: 'Черновик',  color: '#f59e0b' },
}

export function GroupDetailPage({ groupId, onBack }: Props) {
  const { data, error, loading, admins, regularMembers } = useGroupDetailPageVM(groupId)

  if (error)   return <div style={{ color: '#dc2626', fontSize: 14 }}>Ошибка: {error}</div>
  if (loading) return <div style={{ color: '#94a3b8', fontSize: 14 }}>Загрузка…</div>
  if (!data)   return null

  const { group, creator, events, recentActivity } = data

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={backBtn}>← Группы</button>
        <h1 style={h1}>{group.name}</h1>
        <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{group.id}</span>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <MetaChip label="Создана" value={fmtDate(group.created_at)} />
        <MetaChip label="Участников" value={String(group.member_count)} />
        <MetaChip label="Мероприятий" value={String(group.event_count)} />
        <MetaChip label="Товаров" value={String(group.item_count)} />
        <MetaChip label="Код приглашения" value={group.invite_code} mono />
        {group.tg_chat_id && <MetaChip label="TG Chat ID" value={String(group.tg_chat_id)} mono />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: creator + members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Creator */}
          {creator && (
            <div style={card}>
              <div style={cardTitle}>Создатель группы</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={avatar}>{creator.name.slice(0, 1).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{creator.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    ID: {creator.user_id} · вступил {fmtDate(creator.joined_at)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admins */}
          {admins.length > 1 && (
            <div style={card}>
              <div style={cardTitle}>Администраторы ({admins.length})</div>
              {admins.map(m => (
                <MemberRow key={m.user_id} m={m} />
              ))}
            </div>
          )}

          {/* Members */}
          <div style={card}>
            <div style={cardTitle}>Участники ({regularMembers.length})</div>
            {regularMembers.length === 0
              ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Только создатель</div>
              : regularMembers.map(m => <MemberRow key={m.user_id} m={m} />)
            }
          </div>
        </div>

        {/* Right: events + activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Events */}
          <div style={card}>
            <div style={cardTitle}>Мероприятия ({events.length})</div>
            {events.length === 0
              ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Нет мероприятий</div>
              : events.map(e => {
                  const s = STATUS_LABEL[e.status] ?? { label: e.status, color: '#94a3b8' }
                  return (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(e.event_date)}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.color + '18', padding: '2px 8px', borderRadius: 20 }}>
                        {s.label}
                      </span>
                    </div>
                  )
                })
            }
          </div>

          {/* Recent activity */}
          <div style={card}>
            <div style={cardTitle}>Последняя активность ({recentActivity.length})</div>
            {recentActivity.length === 0
              ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Нет данных</div>
              : recentActivity.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                      <span style={{ color: '#6366f1', fontWeight: 600, flexShrink: 0 }}>{a.type}</span>
                      {a.platform && (
                        <span style={{ color: '#94a3b8', fontSize: 10, background: '#f1f5f9', padding: '1px 6px', borderRadius: 10, flexShrink: 0 }}>
                          {a.platform}
                        </span>
                      )}
                      {a.user_id && (
                        <span style={{ color: '#94a3b8', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.user_id}
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#94a3b8', flexShrink: 0, marginLeft: 8 }}>{fmtTime(a.created_at)}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MemberRow({ m }: { m: { user_id: string; name: string; joined_at: string; is_admin: boolean } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #f8fafc' }}>
      <div style={{ ...avatar, width: 28, height: 28, fontSize: 11 }}>{m.name.slice(0, 1).toUpperCase()}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{m.name}</div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.user_id}</div>
      </div>
      <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>{fmtDate(m.joined_at)}</span>
    </div>
  )
}

function MetaChip({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '8px 14px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// ── Styles ────────────────────────────────────────────────────────────────────

const h1: React.CSSProperties      = { fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }
const card: React.CSSProperties    = { background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const cardTitle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }
const backBtn: React.CSSProperties = {
  padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: 'transparent', color: '#64748b', fontSize: 12,
  cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit',
}
const avatar: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff',
  color: '#6366f1', fontWeight: 800, fontSize: 14,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
