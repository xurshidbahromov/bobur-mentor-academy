// src/hooks/useTranslation.js
// Simple i18n hook — no heavy library, just a JS object lookup
// Default language: Uzbek (uz)
// To switch language: change VITE_APP_LANG in .env.local (future: user preference in localStorage)

import uz from '../locales/uz'
import ru from '../locales/ru'
import en from '../locales/en'

const locales = { uz, ru, en }

const defaultLang = import.meta.env.VITE_APP_LANG || 'uz'

/**
 * Get a nested value from an object using a dot-notation key
 * e.g. get(obj, 'nav.login') → obj.nav.login
 */
const get = (obj, path) => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

/**
 * useTranslation hook
 * Returns a t() function that looks up translation keys
 *
 * Usage:
 *   const { t } = useTranslation()
 *   t('nav.login')       → 'Kirish'
 *   t('lessons.free')    → 'Bepul'
 */
export function useTranslation() {
  const lang = defaultLang
  const locale = locales[lang] || locales.uz

  const t = (key, fallback = key) => {
    return get(locale, key) ?? fallback
  }

  return { t, lang }
}
