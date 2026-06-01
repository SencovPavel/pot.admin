import { useState, useCallback } from 'react'
import { login } from '@shared/api/api'
import type { Me } from '@shared/types'

export function useLoginPageVM(onLogin: (me: Me) => void) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const me = await login(email, password)
      if (!me.is_superadmin) {
        setError('Нет прав администратора')
        return
      }
      onLogin(me as Me)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }, [email, password, onLogin])

  return { email, setEmail, password, setPassword, error, loading, handleSubmit }
}
