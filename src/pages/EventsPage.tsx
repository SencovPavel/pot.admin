import { useState, useEffect } from 'react'
import { fetchEvents } from '@shared/api/api'
import { fmtDateMsk } from '@shared/lib/format'

interface Props {
  onEventClick: (groupId: string, eventId: string) => void
}

export function EventsPage({ onEventClick }: Props) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchEvents>>['rows']>([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchEvents({ status: status || undefined, limit: 100 })
      .then(r => { setRows(r.rows); setTotal(r.total) })
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div>
      <h1 style={h1}>Мероприятия</h1>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{total} всего</p>
      <select value={status} onChange={e => setStatus(e.target.value)} style={{ marginBottom: 16, padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <option value="">Все статусы</option>
        <option value="active">active</option>
        <option value="completed">completed</option>
      </select>
      {loading ? <div>Загрузка…</div> : (
        <div style={wrap}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={th}>Название</th>
                <th style={th}>Группа</th>
                <th style={th}>Дата</th>
                <th style={th}>Статус</th>
                <th style={thR}>Товары</th>
                <th style={thR}>RSVP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => (
                <tr key={e.id} onClick={() => onEventClick(e.group_id, e.id)} style={{ cursor: 'pointer', background: i % 2 ? '#fafafa' : '#fff' }}>
                  <td style={td}><b>{e.name}</b></td>
                  <td style={td}>{e.group_name}</td>
                  <td style={td}>{fmtDateMsk(e.event_date)}</td>
                  <td style={td}>{e.status}</td>
                  <td style={tdR}>{e.items_count}</td>
                  <td style={tdR}>{e.rsvp_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 800, marginBottom: 8 }
const wrap: React.CSSProperties = { background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b' }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 14px' }
const tdR: React.CSSProperties = { ...td, textAlign: 'right', fontWeight: 600 }
