import { useState, useEffect } from 'react'
import { fetchUserDetail, patchUserSuperadmin } from '@shared/api/api'
import { fmtDateMsk } from '@shared/lib/format'

interface Props {
  userId: string
  onBack: () => void
  onGroupClick: (groupId: string) => void
}

export function UserDetailPage({ userId, onBack, onGroupClick }: Props) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchUserDetail>> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetchUserDetail(userId)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [userId])

  const toggleSuperadmin = async () => {
    if (!data) return
    const next = !data.user.is_superadmin
    if (!confirm(next ? 'Выдать superadmin?' : 'Снять superadmin?')) return
    await patchUserSuperadmin(userId, next)
    load()
  }

  if (error) return <div style={{ color: '#dc2626' }}>{error}</div>
  if (loading || !data) return <div style={{ color: '#94a3b8' }}>Загрузка…</div>

  const { user, oauth, groups, family, recentActivity } = data

  return (
    <div>
      <button type="button" onClick={onBack} style={back}>← Пользователи</button>
      <h1 style={h1}>{user.name}</h1>
      <p style={{ color: '#64748b', fontSize: 13 }}>{user.email}{user.is_telegram_stub ? ' (Telegram)' : ''}</p>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        <Meta label="ID" value={user.id} mono />
        <Meta label="Регистрация" value={fmtDateMsk(user.created_at)} />
        <Meta label="Superadmin" value={user.is_superadmin ? 'да' : 'нет'} />
        <button type="button" onClick={toggleSuperadmin} style={btn}>
          {user.is_superadmin ? 'Снять superadmin' : 'Сделать superadmin'}
        </button>
      </div>

      {oauth.length > 0 && (
        <Section title="OAuth">
          {oauth.map(o => (
            <div key={`${o.provider}-${o.provider_id}`} style={{ fontSize: 13 }}>
              {o.provider}: {o.provider_id} {o.email && `(${o.email})`}
            </div>
          ))}
        </Section>
      )}

      <Section title={`Группы (${groups.length})`}>
        {groups.map(g => (
          <div key={g.id} role="button" onClick={() => onGroupClick(g.id)} style={row}>
            {g.emoji} <b>{g.name}</b> {g.is_admin && '★'} · {fmtDateMsk(g.joined_at)}
          </div>
        ))}
      </Section>

      <Section title={`Семья (${family.length})`}>
        {family.map(f => (
          <div key={f.id} style={row}>{f.name}{f.label ? ` · ${f.label}` : ''}</div>
        ))}
      </Section>

      <Section title="Активность">
        {recentActivity.map((a, i) => (
          <div key={i} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
            <b>{a.label}</b> · {fmtDateMsk(a.created_at)}
            {a.group_id && <span style={{ color: '#94a3b8' }}> · {a.group_id}</span>}
          </div>
        ))}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
      <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: '#64748b' }}>{title}</div>
      {children}
    </div>
  )
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>
      <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 13, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 800, margin: '8px 0' }
const back: React.CSSProperties = { padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer', fontSize: 12 }
const btn: React.CSSProperties = { padding: '8px 14px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }
const row: React.CSSProperties = { padding: '6px 0', borderBottom: '1px solid #f8fafc', cursor: 'pointer', fontSize: 13 }
