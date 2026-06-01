import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useDashboardPageVM } from './useDashboardPageVM'
import { StatCard } from '@shared/components/StatCard'

const PLATFORM_COLORS: Record<string, string> = {
  telegram: '#2AABEE',
  web:      '#6366f1',
  max:      '#f59e0b',
  unknown:  '#94a3b8',
}

export function DashboardPage() {
  const { data, error, sparklineData } = useDashboardPageVM()

  if (error) return <Err msg={error} />
  if (!data)  return <Loading />

  return (
    <div>
      <h1 style={h1}>Обзор</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Групп"               value={data.totalGroups}   accent="#6366f1" />
        <StatCard label="Пользователей"       value={data.totalUsers}    accent="#2AABEE" />
        <StatCard label="Активных мероприятий" value={data.activeEvents} accent="#10b981" />
        <StatCard label="Товаров"             value={data.totalItems}    accent="#f59e0b" />
        <StatCard label="Активны сегодня"     value={data.activeToday}   accent="#ec4899" sub="уникальных пользователей" />
        <StatCard label="Активны за неделю"   value={data.activeWeek}    accent="#8b5cf6" sub="уникальных пользователей" />
        <StatCard label="Новых групп за неделю" value={data.newGroupsWeek} accent="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={card}>
          <div style={cardTitle}>Активность за 14 дней</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sparklineData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" name="События" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <div style={cardTitle}>Платформы</div>
          {data.platforms.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Нет данных</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.platforms} layout="vertical" margin={{ top: 4, right: 12, left: 16, bottom: 4 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <YAxis type="category" dataKey="platform" tick={{ fontSize: 12, fill: '#64748b' }} width={72} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" name="События" radius={[0, 4, 4, 0]} fill="#6366f1" label={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.platforms.map(p => (
              <div key={p.platform} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{
                  display: 'inline-block', width: 10, height: 10, borderRadius: 3,
                  background: PLATFORM_COLORS[p.platform] ?? '#94a3b8', flexShrink: 0,
                }} />
                <span style={{ color: '#1e293b', fontWeight: 600, flex: 1 }}>{p.platform}</span>
                <span style={{ color: '#64748b' }}>{p.count.toLocaleString('ru-RU')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Loading() { return <div style={{ color: '#94a3b8', fontSize: 14 }}>Загрузка…</div> }
function Err({ msg }: { msg: string }) { return <div style={{ color: '#dc2626', fontSize: 14 }}>Ошибка: {msg}</div> }

const h1: React.CSSProperties      = { fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 24, letterSpacing: '-0.02em' }
const card: React.CSSProperties    = { background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const cardTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 16 }
