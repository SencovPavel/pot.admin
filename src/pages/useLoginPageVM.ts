import { useState, useCallback } from 'react'
import { login, devLogin, getMe } from '@shared/api/api'
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
      await login(email, password)
      const me = await getMe()
      if (!me?.is_superadmin) {
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

  const handleDevLogin = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      await devLogin()
      const me = await getMe()
      if (!me?.is_superadmin) {
        setError('Нет прав администратора (перезапустите backend с актуальным кодом)')
        return
      }
      onLogin(me as Me)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка dev-login')
    } finally {
      setLoading(false)
    }
  }, [onLogin])

  return { email, setEmail, password, setPassword, error, loading, handleSubmit, handleDevLogin }
}
