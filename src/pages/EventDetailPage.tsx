import { useState, useEffect } from 'react'
import { fetchEventDetail } from '@shared/api/api'
import { fmtDateMsk, fmtNum } from '@shared/lib/format'
import { JsonDetails } from '@shared/components/JsonDetails'

interface Props {
  groupId: string
  eventId: string
  onBack: () => void
}

export function EventDetailPage({ groupId, eventId, onBack }: Props) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchEventDetail>> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEventDetail(groupId, eventId)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
  }, [groupId, eventId])

  if (error) return <div style={{ color: '#dc2626' }}>{error}</div>
  if (!data) return <div>Загрузка…</div>

  const { event, items, itemsTotalSum, boughtPct, rsvp, familyRsvp, activity } = data

  return (
    <div>
      <button type="button" onClick={onBack} style={back}>← Назад</button>
      <h1 style={h1}>{event.name}</h1>
      <p style={{ fontSize: 13, color: '#64748b' }}>{event.group_name} · {event.status} · {fmtDateMsk(event.event_date)}</p>

      <div style={{ display: 'flex', gap: 16, margin: '16px 0', flexWrap: 'wrap' }}>
        <Stat label="Сумма" value={`${fmtNum(Math.round(itemsTotalSum))} ₽`} />
        <Stat label="Куплено" value={`${boughtPct}%`} />
        <Stat label="Позиций" value={String(items.length)} />
        <Stat label="RSVP" value={String(rsvp.filter(r => r.attending).length)} />
      </div>

      <div style={card}>
        <h2 style={h2}>Список</h2>
        {items.map(it => (
          <div key={it.id} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
            {it.bought ? '✓ ' : ''}{it.name} — {it.qty} {it.unit} · {it.source}
          </div>
        ))}
      </div>

      <div style={card}>
        <h2 style={h2}>Активность</h2>
        {activity.map((a, i) => (
          <div key={i} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
            <b>{a.label}</b> {a.actor_name} · {fmtDateMsk(a.created_at)}
            <JsonDetails data={a.data} />
          </div>
        ))}
      </div>

      {familyRsvp.length > 0 && (
        <div style={card}>
          <h2 style={h2}>Семья на событии</h2>
          {familyRsvp.map(f => (
            <div key={f.family_member_id} style={{ fontSize: 13 }}>{f.name} — {f.attending ? 'идёт' : 'нет'}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{value}</div>
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 800, margin: '8px 0' }
const h2: React.CSSProperties = { fontSize: 14, fontWeight: 700, marginBottom: 10 }
const back: React.CSSProperties = { padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer', fontSize: 12 }
const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
