import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useActivityPageVM, DAYS_OPTIONS } from './useActivityPageVM'

const TYPE_COLORS = [
  '#6366f1', '#2AABEE', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316',
]

const PLATFORM_COLORS: Record<string, string> = {
  telegram: '#2AABEE',
  web:      '#6366f1',
  max:      '#f59e0b',
  unknown:  '#94a3b8',
}

export function ActivityPage() {
  const { days, setDays, data, error, loading, byDayPivot, platformPivot, topTypes, platformKeys, topTypeKeys } = useActivityPageVM()

  if (error) return <div style={{ color: '#dc2626', fontSize: 14 }}>Ошибка: {error}</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h1 style={h1}>Активность</h1>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {DAYS_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: '5px 12px', borderRadius: 8,
                border: '1px solid ' + (days === d ? '#6366f1' : '#e2e8f0'),
                background: days === d ? '#6366f1' : '#fff',
                color: days === d ? '#fff' : '#64748b',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {d}д
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Загрузка…</div>
      ) : !data ? null : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <div style={cardTitle}>События по дням и типам (топ-10)</div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={byDayPivot} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                {topTypeKeys.slice(0, 10).map((type, i) => (
                  <Line key={type} type="monotone" dataKey={type}
                    stroke={TYPE_COLORS[i % TYPE_COLORS.length]} strokeWidth={1.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={card}>
              <div style={cardTitle}>Топ типов событий</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topTypes} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} width={140} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Кол-во" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={card}>
              <div style={cardTitle}>Платформы по дням</div>
              {platformPivot.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: 13 }}>Нет данных</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={platformPivot} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    {platformKeys.map(platform => (
                      <Line key={platform} type="monotone" dataKey={platform}
                        stroke={PLATFORM_COLORS[platform] ?? '#94a3b8'} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const h1: React.CSSProperties      = { fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }
const card: React.CSSProperties    = { background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const cardTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 16 }
