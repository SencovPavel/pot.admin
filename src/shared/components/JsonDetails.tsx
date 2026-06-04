interface JsonDetailsProps {
  data: unknown
  label?: string
}

export function JsonDetails({ data, label = 'Детали' }: JsonDetailsProps) {
  if (data === null || data === undefined) return null
  const empty = typeof data === 'object' && Object.keys(data as object).length === 0
  if (empty) return null

  return (
    <details style={{ marginTop: 4 }}>
      <summary style={{ fontSize: 11, color: '#64748b', cursor: 'pointer' }}>{label}</summary>
      <pre style={{
        fontSize: 10,
        background: '#f8fafc',
        padding: 8,
        borderRadius: 6,
        overflow: 'auto',
        maxHeight: 120,
        marginTop: 4,
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  )
}
