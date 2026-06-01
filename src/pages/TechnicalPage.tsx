import { useState, useEffect } from 'react'
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { fetchTechnical } from '../api'

type Technical = Awaited<ReturnType<typeof fetchTechnical>>

export function TechnicalPage() {
  const [data, setData] = useState<Technical | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTechnical()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (error) return <div style={{ color: '#dc2626', fontSize: 14 }}>Ошибка: {error}</div>
  if (loading) return <div style={{ color: '#94a3b8', fontSize: 14 }}>Загрузка…</div>
  if (!data) return null

  const hourlyFull = Array.from({ length: 24 }, (_, h) => {
    const found = data.hourly.find(r => r.hour === h)
    return { hour: `${String(h).padStart(2, '0')}:00`, count: found?.count ?? 0 }
  })

  return (
    <div>
      <h1 style={h1}>Технические</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Total events by day */}
        <div style={card}>
          <div style={cardTitle}>Всего событий по дням (7 дней)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.totalByDay.map(d => ({ day: fmtDay(d.day), count: d.count }))}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#agrad)" name="События" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Hourly distribution */}
          <div style={card}>
            <div style={cardTitle}>Распределение по часам (UTC, 7 дней)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyFull} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} name="Событий" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top types */}
          <div style={card}>
            <div style={cardTitle}>Топ-20 типов (30 дней)</div>
            <div style={{ overflowY: 'auto', maxHeight: 200 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={thL}>#</th>
                    <th style={thL}>Тип</th>
                    <th style={thR}>Кол-во</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topTypes.map((t, i) => (
                    <tr key={t.type} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ ...tdL, color: '#94a3b8', width: 28 }}>{i + 1}</td>
                      <td style={tdL}>{t.type}</td>
                      <td style={{ ...tdR, fontWeight: 700 }}>{t.count.toLocaleString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Error log */}
        <div style={card}>
          <div style={cardTitle}>Последние ошибки ({data.errors.length})</div>
          {data.errors.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Ошибок нет 🎉</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 600 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={thL}>ID</th>
                    <th style={thL}>Тип</th>
                    <th style={thL}>User</th>
                    <th style={thL}>Group</th>
                    <th style={thL}>Meta</th>
                    <th style={thL}>Время</th>
                  </tr>
                </thead>
                <tbody>
                  {data.errors.map((e, i) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ ...tdL, color: '#94a3b8' }}>{e.id}</td>
                      <td style={{ ...tdL, color: '#dc2626', fontWeight: 600 }}>{e.type}</td>
                      <td style={{ ...tdL, color: '#94a3b8' }}>{e.user_id ?? '—'}</td>
                      <td style={{ ...tdL, color: '#94a3b8' }}>{e.group_id ?? '—'}</td>
                      <td style={tdL}>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
                          {JSON.stringify(e.meta).slice(0, 60)}
                        </span>
                      </td>
                      <td style={{ ...tdL, whiteSpace: 'nowrap' }}>{fmtDateTime(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function fmtDay(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}
function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const h1: React.CSSProperties = {
  fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 24, letterSpacing: '-0.02em',
}
const card: React.CSSProperties = {
  background: '#fff', borderRadius: 14, padding: '20px 22px',
  boxShadow: '0 1px 4px rgba(0,0,0,.06)',
}
const cardTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 16,
}
const thL: React.CSSProperties = {
  padding: '7px 12px', textAlign: 'left', fontWeight: 700, color: '#94a3b8',
  fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em',
}
const thR: React.CSSProperties = { ...thL, textAlign: 'right' }
const tdL: React.CSSProperties = { padding: '7px 12px', textAlign: 'left', verticalAlign: 'middle', color: '#1e293b' }
const tdR: React.CSSProperties = { ...tdL, textAlign: 'right' }
