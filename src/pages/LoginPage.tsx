import { useLoginPageVM } from './useLoginPageVM'
import type { Me } from '@shared/types'

interface Props {
  onLogin: (me: Me) => void
}

export function LoginPage({ onLogin }: Props) {
  const { email, setEmail, password, setPassword, error, loading, handleSubmit, handleDevLogin } = useLoginPageVM(onLogin)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f1f5f9',
    }}>
      <form
        onSubmit={e => { e.preventDefault(); handleSubmit() }}
        style={{
          background: '#fff', borderRadius: 16, padding: '36px 32px', width: 360,
          boxShadow: '0 4px 24px rgba(0,0,0,.08)',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4, color: '#1e293b' }}>Котёл Admin</div>
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

        <button
          type="button"
          disabled={loading}
          onClick={handleDevLogin}
          style={{
            marginTop: 10, width: '100%', padding: '10px 0', borderRadius: 10,
            border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b',
            fontWeight: 600, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Dev-вход (локально)
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
