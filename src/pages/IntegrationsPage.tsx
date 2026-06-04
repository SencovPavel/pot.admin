import { useState, useEffect } from 'react'
import { fetchIntegrations, fetchHealth, fetchAuditLog } from '@shared/api/api'
import { fmtDateMsk } from '@shared/lib/format'
import { fmtNum } from '@shared/lib/format'

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Awaited<ReturnType<typeof fetchIntegrations>> | null>(null)
  const [health, setHealth] = useState<Awaited<ReturnType<typeof fetchHealth>> | null>(null)
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof fetchAuditLog>>>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchIntegrations(), fetchHealth(), fetchAuditLog()])
      .then(([i, h, a]) => { setIntegrations(i); setHealth(h); setAudit(a) })
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка'))
  }, [])

  if (error) return <div style={{ color: '#dc2626' }}>{error}</div>
  if (!integrations || !health) return <div>Загрузка…</div>

  return (
    <div>
      <h1 style={h1}>Интеграции</h1>

      <div style={card}>
        <h2 style={h2}>Здоровье</h2>
        <div style={{ fontSize: 13, display: 'grid', gap: 6 }}>
          <div>Окружение: <b>{health.nodeEnv}</b></div>
          <div>Uptime: <b>{Math.floor(health.uptimeSec / 60)} мин</b></div>
          <div>Бот: <b>{health.botConfigured ? 'настроен' : 'нет BOT_TOKEN'}</b></div>
          <div>Public URL: <b>{health.publicUrl ?? '—'}</b></div>
          {health.errors24h.length > 0 && (
            <div>Ошибки 24ч: {health.errors24h.map(e => `${e.type} (${e.count})`).join(', ')}</div>
          )}
        </div>
      </div>

      {health.tableSizes.length > 0 && (
        <div style={card}>
          <h2 style={h2}>Размер таблиц</h2>
          {health.tableSizes.map(t => (
            <div key={t.table_name} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{t.table_name}</span>
              <span>{fmtNum(Math.round(Number(t.size_bytes) / 1024))} KB</span>
            </div>
          ))}
        </div>
      )}

      <div style={card}>
        <h2 style={h2}>Telegram ({integrations.telegramLinked.length})</h2>
        {integrations.chatMessages7d != null && (
          <p style={{ fontSize: 12, color: '#64748b' }}>Сообщений чата за 7д: {integrations.chatMessages7d}</p>
        )}
        {integrations.telegramLinked.slice(0, 20).map(g => (
          <div key={g.id} style={row}>{g.name} · chat {g.tg_chat_id} · msg 7д: {g.messages_7d}</div>
        ))}
      </div>

      <div style={card}>
        <h2 style={h2}>Без бота ({integrations.noBot.length})</h2>
        {integrations.noBot.slice(0, 20).map(g => (
          <div key={g.id} style={row}>{g.name} · {g.member_count} уч.</div>
        ))}
      </div>

      <div style={card}>
        <h2 style={h2}>MAX ({integrations.maxLinked.length})</h2>
        {integrations.maxLinked.map(g => (
          <div key={g.id} style={row}>{g.name} · {g.max_chat_id}</div>
        ))}
      </div>

      {audit.length > 0 && (
        <div style={card}>
          <h2 style={h2}>Журнал admin-действий</h2>
          {audit.map(a => (
            <div key={a.id} style={row}>
              {fmtDateMsk(a.created_at)} · {a.action} · {a.target_type}/{a.target_id} · {a.actor_id}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 800, marginBottom: 20 }
const h2: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10 }
const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const row: React.CSSProperties = { fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f8fafc' }
