// src/context/TelegramProvider.jsx
// Telegram Mini App SDK integration.
// - Expands the app to full screen
// - Calls ready() to hide the loading screen
// - Provides tgUser and isTelegram flag to the app

import { createContext, useContext, useEffect, useState } from 'react'
import { init, miniApp, viewport, backButton, retrieveLaunchParams } from '@telegram-apps/sdk-react'

const TelegramContext = createContext(null)

export function TelegramProvider({ children }) {
  const [tgUser, setTgUser]       = useState(null)
  const [isTelegram, setIsTelegram] = useState(false)
  const [isReady, setIsReady]     = useState(false)

  useEffect(() => {
    try {
      // Check if we're running inside Telegram
      const tg = window?.Telegram?.WebApp
      if (!tg || !tg.initData) {
        // Normal browser — not Telegram
        setIsReady(true)
        return
      }

      setIsTelegram(true)

      // Initialize SDK
      init()

      // Expand to full screen
      if (viewport.mount.isAvailable()) {
        viewport.mount().then(() => {
          viewport.expand()
        }).catch(() => {})
      }

      // Tell Telegram the app is ready (hides loader)
      if (miniApp.mount.isAvailable()) {
        miniApp.mount().then(() => {
          miniApp.ready()
        }).catch(() => {})
      }

      // Get launch params (contains user info)
      try {
        const params = retrieveLaunchParams()
        const user = params?.initData?.user
        if (user) {
          setTgUser({
            id:         user.id,
            firstName:  user.firstName || user.first_name || '',
            lastName:   user.lastName  || user.last_name  || '',
            username:   user.username  || '',
            photoUrl:   user.photoUrl  || user.photo_url  || null,
            languageCode: user.languageCode || user.language_code || 'uz',
          })
        }
      } catch {
        // Could not parse launch params — still inside Telegram but no user data
        const tgUser = tg.initDataUnsafe?.user
        if (tgUser) {
          setTgUser({
            id:         tgUser.id,
            firstName:  tgUser.first_name || '',
            lastName:   tgUser.last_name  || '',
            username:   tgUser.username   || '',
            photoUrl:   tgUser.photo_url  || null,
            languageCode: tgUser.language_code || 'uz',
          })
        }
      }

    } catch {
      // SDK failed — treat as normal browser
    } finally {
      setIsReady(true)
    }
  }, [])

  return (
    <TelegramContext.Provider value={{ tgUser, isTelegram, isReady }}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  return useContext(TelegramContext)
}
