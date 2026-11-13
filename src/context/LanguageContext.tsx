import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'id' | 'en'

const STORAGE_KEY = 'naii-cifp26:lang'

interface LanguageCtx {
  lang: Lang
  toggleLang: () => void
  setLang: (l: Lang) => void
}

const Ctx = createContext<LanguageCtx | null>(null)

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved === 'id' || saved === 'en') return saved
  } catch {
    /* ignore storage error */
  }
  return 'id'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setState] = useState<Lang>(getInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore storage errors */
    }
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setState(l)
  }, [])

  const toggleLang = useCallback(() => {
    setState((prev) => (prev === 'id' ? 'en' : 'id'))
  }, [])

  const value = useMemo(() => ({ lang, toggleLang, setLang }), [lang, toggleLang, setLang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage(): LanguageCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>')
  return ctx
}
