# Котёл Admin

Панель суперадмина для мониторинга групп, пользователей и аналитики.

## Доступ

1. Пользователь в таблице `users` с `is_superadmin = TRUE`.
2. Локально: вход через `POST /auth/dev-login` (см. `DEV_USER_EMAIL` в `.env` бэкенда).
3. Вход email/пароль на странице логина админки.

## Запуск локально

```bash
# backend (порт 3001)
cd picnic-backend && npm start

# admin UI (порт 5174, прокси на API)
cd picnic-admin && npm run dev
```

Откройте http://localhost:5174

## Деплой

- `admin-main` / `admin-dev` на сервере (см. `.github/workflows/deploy.yml`)
- Nginx проксирует `/admin/*` и auth cookie на backend

## Разделы

- **Обзор** — метрики, воронка, retention
- **Группы** — фильтры, бот TG/MAX, карточка с вкладками
- **Пользователи** — аккаунты `users`, superadmin
- **Мероприятия** — события по всем группам
- **Активность / Технические** — `analytics_events`
- **Интеграции** — бот, health, размеры таблиц
