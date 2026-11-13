import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme) || 'dark',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable */
    }
  }, [theme])
  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}

/** Current theme name, kept in sync with <html data-theme>. Safe to use from lazy-loaded chunks. */
export function useThemeName(): Theme {
  const read = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark') as Theme
  const [t, setT] = useState<Theme>(read)
  useEffect(() => {
    const mo = new MutationObserver(() => setT(read()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return t
}
