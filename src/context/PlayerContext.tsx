import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { saveLead } from '../lib/storage'
import type { PassportState, Player } from '../types'

const KEY = 'naii-cifp26:player'
const PASSPORT_KEY = 'naii-cifp26:passport-v2'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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
  qrModalOpen: boolean
  setQrModalOpen: (open: boolean) => void
  unlockGameStamp: (gameLabel: string, score: number) => void
  verifyNaiiAccountByStaff: (email?: string, consented?: boolean) => void
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
      if (parsed && parsed.ticketCode && parsed.stamp1 && parsed.stamp2) {
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
  const [qrModalOpen, setQrModalOpen] = useState(false)

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
    setQrModalOpen(false)
    try {
      localStorage.removeItem(KEY)
      sessionStorage.removeItem(KEY)
      localStorage.setItem(PASSPORT_KEY, JSON.stringify(fresh))
    } catch {
      /* abaikan */
    }
  }, [])

  const unlockGameStamp = useCallback((gameLabel: string, score: number) => {
    setPassportState((prev) => {
      const isBetter = prev.stamp1.score === undefined || score >= prev.stamp1.score
      const next: PassportState = {
        ...prev,
        stamp1: {
          unlocked: true,
          gameLabel: isBetter ? gameLabel : (prev.stamp1.gameLabel ?? gameLabel),
          score: isBetter ? score : prev.stamp1.score,
          stampedAt: prev.stamp1.stampedAt ?? new Date().toISOString(),
        },
      }
      persistPassport(next)
      return next
    })
  }, [])

  const verifyNaiiAccountByStaff = useCallback(
    (email?: string, consented?: boolean) => {
      setPassportState((prev) => {
        const next: PassportState = {
          ...prev,
          stamp2: {
            unlocked: true,
            verifiedByStaff: true,
            stampedAt: prev.stamp2.stampedAt ?? new Date().toISOString(),
          },
        }
        persistPassport(next)
        return next
      })
      const trimmedEmail = email?.trim() ?? ''
      const hasExplicitConsent = Boolean(consented || (player?.consent && trimmedEmail === (player?.email ?? '')))
      if (trimmedEmail && EMAIL_RE.test(trimmedEmail) && hasExplicitConsent) {
        const basePlayer: Player = player ?? {
          name: 'Delegasi CIFP',
          institution: 'CIFP 2026',
          email: trimmedEmail,
          consent: true,
        }
        const updatedPlayer: Player = { ...basePlayer, email: trimmedEmail, consent: true }
        setState(updatedPlayer)
        try {
          localStorage.setItem(KEY, JSON.stringify(updatedPlayer))
          sessionStorage.setItem(KEY, JSON.stringify(updatedPlayer))
        } catch {
          /* abaikan */
        }
        void saveLead(updatedPlayer, 'passport-naii-account')
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

  const stampCount = (passport.stamp1.unlocked ? 1 : 0) + (passport.stamp2.unlocked ? 1 : 0)

  const value = useMemo(
    () => ({
      player,
      setPlayer,
      clearPlayer,
      passport,
      stampCount,
      passportOpen,
      setPassportOpen,
      qrModalOpen,
      setQrModalOpen,
      unlockGameStamp,
      verifyNaiiAccountByStaff,
      markTicketClaimed,
    }),
    [
      player,
      setPlayer,
      clearPlayer,
      passport,
      stampCount,
      passportOpen,
      qrModalOpen,
      unlockGameStamp,
      verifyNaiiAccountByStaff,
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
