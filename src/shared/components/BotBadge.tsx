interface BotBadgeProps {
  telegram?: boolean
  max?: boolean
}

export function BotBadge({ telegram, max }: BotBadgeProps) {
  if (!telegram && !max) {
    return <span style={{ fontSize: 11, color: '#94a3b8' }}>нет</span>
  }
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {telegram && (
        <span style={pillStyle('#e0f2fe', '#0369a1')}>TG</span>
      )}
      {max && (
        <span style={pillStyle('#fef3c7', '#b45309')}>MAX</span>
      )}
    </span>
  )
}

function pillStyle(bg: string, color: string): React.CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 6,
    background: bg,
    color,
  }
}
