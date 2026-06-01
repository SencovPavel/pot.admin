import { useState } from 'react'
import { login } from '../api'

interface Me { id: string; name: string; email: string; is_superadmin?: boolean }

interface Props {
  onLogin: (me: Me) => void
}

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const me = await login(email, password)
      if (!(me as Me & { is_superadmin?: boolean }).is_superadmin) {
        setError('Нет прав администратора')
        return
      }
      onLogin(me as Me)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f1f5f9',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff', borderRadius: 16, padding: '36px 32px', width: 360,
          boxShadow: '0 4px 24px rgba(0,0,0,.08)',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4, color: '#1e293b' }}>🧺 Picnic Admin</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>Вход в панель администратора</div>

        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
          style={inputStyle}
          placeholder="admin@example.com"
        />

        <label style={{ ...labelStyle, marginTop: 16 }}>Пароль</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
          placeholder="••••••••"
        />

        {error && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 24, width: '100%', padding: '10px 0', borderRadius: 10,
            border: 'none', background: '#1e293b', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'opacity .15s',
          }}
        >
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
  fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color .15s',
}
