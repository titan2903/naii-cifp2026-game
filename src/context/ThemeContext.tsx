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
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore storage errors */
    }
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setState(t)
  }, [])

  const toggleTheme = useCallback(() => {
    setState((prev) => (prev === 'dark' ? 'light' : 'dark'))
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
