import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { saveLead } from '../lib/storage'
import type { GameId, PassportState, Player } from '../types'

const KEY = 'naii-cifp26:player'
const PASSPORT_KEY = 'naii-cifp26:passport'

function generateTicketCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `NAII-26-${code}`
}

function createInitialPassport(): PassportState {
  return {
    ticketCode: generateTicketCode(),
    stamp1: { unlocked: false },
    stamp2: { unlocked: false },
    stamp3: { unlocked: false },
    claimedByStaff: false,
  }
}

interface PlayerCtx {
  player: Player | null
  setPlayer: (p: Player) => void
  clearPlayer: () => void
  passport: PassportState
  stampCount: number
  passportOpen: boolean
  setPassportOpen: (open: boolean) => void
  unlockStamp1: (personaTitle: string, score: number) => void
  unlockStamp2: (game: GameId, score: number) => void
  unlockStamp3: (codeUsed: string, email?: string) => void
  markTicketClaimed: () => void
}

const Ctx = createContext<PlayerCtx | null>(null)

function loadPlayer(): Player | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Player) : null
  } catch {
    return null
  }
}

function loadPassport(): PassportState {
  try {
    const raw = localStorage.getItem(PASSPORT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PassportState
      if (parsed && parsed.ticketCode && parsed.stamp1 && parsed.stamp2 && parsed.stamp3) {
        return parsed
      }
    }
  } catch {
    /* abaikan */
  }
  const initial = createInitialPassport()
  try {
    localStorage.setItem(PASSPORT_KEY, JSON.stringify(initial))
  } catch {
    /* abaikan */
  }
  return initial
}

function persistPassport(next: PassportState) {
  try {
    localStorage.setItem(PASSPORT_KEY, JSON.stringify(next))
  } catch {
    /* abaikan */
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setState] = useState<Player | null>(loadPlayer)
  const [passport, setPassportState] = useState<PassportState>(loadPassport)
  const [passportOpen, setPassportOpen] = useState(false)

  const setPlayer = useCallback((p: Player) => {
    setState(p)
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
      sessionStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      /* mode privat / storage penuh */
    }
    void saveLead(p, 'booth-registration')
  }, [])

  const clearPlayer = useCallback(() => {
    setState(null)
    const fresh = createInitialPassport()
    setPassportState(fresh)
    setPassportOpen(false)
    try {
      localStorage.removeItem(KEY)
      sessionStorage.removeItem(KEY)
      localStorage.setItem(PASSPORT_KEY, JSON.stringify(fresh))
    } catch {
      /* abaikan */
    }
  }, [])

  const unlockStamp1 = useCallback((personaTitle: string, score: number) => {
    setPassportState((prev) => {
      const isBetter = prev.stamp1.score === undefined || score >= prev.stamp1.score
      const next: PassportState = {
        ...prev,
        stamp1: {
          unlocked: true,
          personaTitle: isBetter ? personaTitle : (prev.stamp1.personaTitle ?? personaTitle),
          score: isBetter ? score : prev.stamp1.score,
          stampedAt: prev.stamp1.stampedAt ?? new Date().toISOString(),
        },
      }
      persistPassport(next)
      return next
    })
  }, [])

  const unlockStamp2 = useCallback((game: GameId, score: number) => {
    setPassportState((prev) => {
      const isBetter = prev.stamp2.score === undefined || score >= prev.stamp2.score
      const next: PassportState = {
        ...prev,
        stamp2: {
          unlocked: true,
          game: isBetter ? game : prev.stamp2.game,
          score: isBetter ? score : prev.stamp2.score,
          stampedAt: prev.stamp2.stampedAt ?? new Date().toISOString(),
        },
      }
      persistPassport(next)
      return next
    })
  }, [])

  const unlockStamp3 = useCallback(
    (codeUsed: string, email?: string) => {
      setPassportState((prev) => {
        const next: PassportState = {
          ...prev,
          stamp3: {
            unlocked: true,
            codeUsed,
            stampedAt: prev.stamp3.stampedAt ?? new Date().toISOString(),
          },
        }
        persistPassport(next)
        return next
      })
      if (email && email.includes('@')) {
        const basePlayer: Player = player ?? {
          name: 'Delegasi CIFP',
          institution: 'CIFP 2026',
          email,
          consent: true,
        }
        const updatedPlayer: Player = { ...basePlayer, email, consent: true }
        setState(updatedPlayer)
        try {
          localStorage.setItem(KEY, JSON.stringify(updatedPlayer))
          sessionStorage.setItem(KEY, JSON.stringify(updatedPlayer))
        } catch {
          /* abaikan */
        }
        void saveLead(updatedPlayer, 'passport-stamp3-claim')
      }
    },
    [player],
  )

  const markTicketClaimed = useCallback(() => {
    setPassportState((prev) => {
      const next: PassportState = {
        ...prev,
        claimedByStaff: true,
        claimedAt: new Date().toISOString(),
      }
      persistPassport(next)
      return next
    })
  }, [])

  const stampCount =
    (passport.stamp1.unlocked ? 1 : 0) +
    (passport.stamp2.unlocked ? 1 : 0) +
    (passport.stamp3.unlocked ? 1 : 0)

  const value = useMemo(
    () => ({
      player,
      setPlayer,
      clearPlayer,
      passport,
      stampCount,
      passportOpen,
      setPassportOpen,
      unlockStamp1,
      unlockStamp2,
      unlockStamp3,
      markTicketClaimed,
    }),
    [
      player,
      setPlayer,
      clearPlayer,
      passport,
      stampCount,
      passportOpen,
      unlockStamp1,
      unlockStamp2,
      unlockStamp3,
      markTicketClaimed,
    ],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayer(): PlayerCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePlayer harus dipakai di dalam <PlayerProvider>')
  return ctx
}
