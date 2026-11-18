import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'naii-cifp26:theme'

interface ThemeCtx {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'dark' || saved === 'light') return saved
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
  } catch {
    /* fallback */
  }
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      root.style.colorScheme = 'light'
    }
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'dark' || saved === 'light') return
      } catch {
        /* ignore storage errors */
      }
      setState(e.matches ? 'light' : 'dark')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setState(t)
    try {
      localStorage.setItem(STORAGE_KEY, t)
    } catch {
      /* ignore storage errors */
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* ignore storage errors */
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme harus digunakan di dalam <ThemeProvider>')
  return ctx
}
