import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useDashboardPageVM } from './useDashboardPageVM'
import { StatCard } from '@shared/components/StatCard'
import { fmtNum } from '@shared/lib/format'

const PLATFORM_COLORS: Record<string, string> = {
  telegram: '#2AABEE',
  web: '#6366f1',
  max: '#f59e0b',
  unknown: '#94a3b8',
}

export function DashboardPage() {
  const { data, error, sparklineData, funnel, retention } = useDashboardPageVM()

  if (error) return <Err msg={error} />
  if (!data) return <Loading />

  return (
    <div>
      <h1 style={h1}>Обзор</h1>

      <div style={gridCards}>
        <StatCard label="Групп" value={data.totalGroups} accent="#6366f1" />
        <StatCard label="Аккаунтов" value={data.registeredUsers} accent="#64748b" sub="users" />
        <StatCard label="Telegram" value={data.telegramUsers} accent="#2AABEE" sub="tg_*@telegram.internal" />
        <StatCard label="Web" value={data.webUsers} accent="#6366f1" />
        <StatCard label="Участников в группах" value={data.groupParticipants} accent="#8b5cf6" />
        {data.membersWithoutAccount > 0 && (
          <StatCard
            label="Без users"
            value={data.membersWithoutAccount}
            accent="#ef4444"
            sub="только group_members"
          />
        )}
        <StatCard label="Активных мероприятий" value={data.activeEvents} accent="#10b981" />
        <StatCard label="Товаров" value={data.totalItems} accent="#f59e0b" />
        <StatCard label="DAU" value={data.dau} accent="#ec4899" sub="MSK, analytics" />
        <StatCard label="WAU" value={data.wau} accent="#8b5cf6" />
        <StatCard label="Новых групп / 7д" value={data.newGroupsWeek} accent="#10b981" />
        <StatCard label="Join / 7д" value={data.joinsWeek} accent="#6366f1" />
        <StatCard label="Без активности 30д" value={data.inactiveGroups30} accent="#ef4444" />
      </div>

      {funnel.length > 0 && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={cardTitle}>Воронка за 30 дней</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {funnel.map((step, i) => {
              const max = funnel[0]?.count || 1
              const h = Math.max(8, Math.round((step.count / max) * 80))
              return (
                <div key={step.key} style={{ textAlign: 'center', minWidth: 72 }}>
                  <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ width: 48, height: h, background: '#6366f1', borderRadius: '4px 4px 0 0', opacity: 1 - i * 0.08 }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', marginTop: 6 }}>{fmtNum(step.count)}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{step.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {retention && retention.cohortSize > 0 && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={cardTitle}>Retention (когорта 90д, {retention.cohortSize} групп)</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <span>D+7: <b>{retention.d7.pct}%</b> ({retention.d7.count})</span>
            <span>D+14: <b>{retention.d14.pct}%</b> ({retention.d14.count})</span>
            <span>D+30: <b>{retention.d30.pct}%</b> ({retention.d30.count})</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={card}>
          <div style={cardTitle}>Активность за 14 дней</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sparklineData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
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
          <div style={cardTitle}>Платформы (30д)</div>
          {data.platforms.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Нет данных</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.platforms} layout="vertical" margin={{ top: 4, right: 12, left: 16, bottom: 4 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="platform" tick={{ fontSize: 12, fill: '#64748b' }} width={72} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.platforms.map(p => (
                  <div key={p.platform} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: PLATFORM_COLORS[p.platform] ?? '#94a3b8' }} />
                    <span style={{ fontWeight: 600, flex: 1 }}>{p.platform}</span>
                    <span style={{ color: '#64748b' }}>{fmtNum(p.count)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Loading() { return <div style={{ color: '#94a3b8', fontSize: 14 }}>Загрузка…</div> }
function Err({ msg }: { msg: string }) { return <div style={{ color: '#dc2626', fontSize: 14 }}>Ошибка: {msg}</div> }

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 24, letterSpacing: '-0.02em' }
const gridCards: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }
const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const cardTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 16 }
