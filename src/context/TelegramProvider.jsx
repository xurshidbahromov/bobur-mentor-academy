// src/context/TelegramProvider.jsx
// Reads Telegram user from window.Telegram.WebApp (native global object).
// Does NOT rely on @telegram-apps/sdk init — more reliable across all clients.

import { createContext, useContext, useEffect, useState } from 'react'

const TelegramContext = createContext({
  tgUser: null,
  isTelegram: false,
  isReady: false,
  tgWebApp: null,
})

export function TelegramProvider({ children }) {
  const [tgUser,     setTgUser]     = useState(null)
  const [isTelegram, setIsTelegram] = useState(false)
  const [isReady,    setIsReady]    = useState(false)
  const [tgWebApp,   setTgWebApp]   = useState(null)
  const [startParam, setStartParam] = useState(null)

  useEffect(() => {
    const tg = window?.Telegram?.WebApp

    // Not inside Telegram
    if (!tg || !tg.initData) {
      setIsReady(true)
      return
    }

    setIsTelegram(true)
    setTgWebApp(tg)

    // 1. Tell Telegram: app is ready (hides native loader)
    tg.ready()

    // 2. Expand to full screen
    tg.expand()

    // 3. Extract user from initDataUnsafe (always available)
    const u = tg.initDataUnsafe?.user
    const param = tg.initDataUnsafe?.start_param
    if (param) setStartParam(param)

    if (u) {
      setTgUser({
        id:           u.id,
        firstName:    u.first_name  || '',
        lastName:     u.last_name   || '',
        username:     u.username    || '',
        photoUrl:     u.photo_url   || null,
        languageCode: u.language_code || 'uz',
        get fullName() {
          return [this.firstName, this.lastName].filter(Boolean).join(' ')
        },
      })
    }

    setIsReady(true)
  }, [])

  return (
    <TelegramContext.Provider value={{ tgUser, isTelegram, isReady, tgWebApp, startParam }}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  return useContext(TelegramContext)
}
