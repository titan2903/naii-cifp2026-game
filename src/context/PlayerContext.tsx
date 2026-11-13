import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { saveLead } from '../lib/storage'
import type { Player } from '../types'

const KEY = 'naii-cifp26:player'

interface PlayerCtx {
  player: Player | null
  setPlayer: (p: Player) => void
  clearPlayer: () => void
}

const Ctx = createContext<PlayerCtx | null>(null)

function load(): Player | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Player) : null
  } catch {
    return null
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setState] = useState<Player | null>(load)

  const setPlayer = useCallback((p: Player) => {
    setState(p)
    try {
      sessionStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* mode privat / storage penuh */
    }
    void saveLead(p, 'booth-registration')
  }, [])

  const clearPlayer = useCallback(() => {
    setState(null)
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* abaikan */
    }
  }, [])

  const value = useMemo(() => ({ player, setPlayer, clearPlayer }), [player, setPlayer, clearPlayer])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayer(): PlayerCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePlayer harus dipakai di dalam <PlayerProvider>')
  return ctx
}
