interface Props {
  label: string
  value: number | string
  sub?: string
  accent?: string
}

export function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      padding: '20px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      borderLeft: accent ? `4px solid ${accent}` : '4px solid transparent',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
        {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{sub}</div>
      )}
    </div>
  )
}
