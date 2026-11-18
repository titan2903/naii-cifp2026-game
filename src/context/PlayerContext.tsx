import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { saveLead } from '../lib/storage'
import type { PassportState, Player } from '../types'

const KEY = 'naii-cifp26:player-v2'
const PASSPORT_KEY = 'naii-cifp26:passport-v2'
const CLAIMED_EMAILS_KEY = 'naii-cifp26:claimed-emails'
const EMAIL_RE = /^[^\s@]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/
const TICKET_RE = /^NAII-26-[2-9A-HJ-NP-Z]{4}$/

function readClaimedEmails(): string[] {
  try {
    const raw = localStorage.getItem(CLAIMED_EMAILS_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function recordClaimedEmail(email?: string) {
  if (!email) return
  const key = email.trim().toLowerCase()
  if (!key) return
  try {
    const list = new Set(readClaimedEmails())
    list.add(key)
    localStorage.setItem(CLAIMED_EMAILS_KEY, JSON.stringify([...list]))
  } catch {
    /* abaikan */
  }
}

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
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Player>
    if (
      parsed &&
      typeof parsed.name === 'string' &&
      parsed.name.trim().length >= 2 &&
      typeof parsed.email === 'string' &&
      EMAIL_RE.test(parsed.email.trim()) &&
      parsed.consent === true
    ) {
      return {
        name: parsed.name,
        institution: typeof parsed.institution === 'string' ? parsed.institution : '',
        email: parsed.email.trim(),
        consent: true,
      }
    }
    return null
  } catch {
    return null
  }
}

function isValidPassport(raw: unknown): raw is PassportState {
  if (!raw || typeof raw !== 'object') return false
  const p = raw as PassportState
  if (typeof p.ticketCode !== 'string' || !TICKET_RE.test(p.ticketCode)) return false
  if (!p.stamp1 || typeof p.stamp1 !== 'object' || typeof p.stamp1.unlocked !== 'boolean') return false
  if (p.stamp1.unlocked) {
    if (typeof p.stamp1.gameLabel !== 'string' || p.stamp1.gameLabel.trim().length < 2) return false
    if (
      typeof p.stamp1.score !== 'number' ||
      !Number.isFinite(p.stamp1.score) ||
      p.stamp1.score < 0 ||
      p.stamp1.score > 750
    ) {
      return false
    }
    if (typeof p.stamp1.stampedAt !== 'string' || Number.isNaN(Date.parse(p.stamp1.stampedAt))) return false
  }
  if (!p.stamp2 || typeof p.stamp2 !== 'object' || typeof p.stamp2.unlocked !== 'boolean') return false
  if (p.stamp2.unlocked) {
    if (p.stamp2.verifiedByStaff !== true) return false
    if (typeof p.stamp2.stampedAt !== 'string' || Number.isNaN(Date.parse(p.stamp2.stampedAt))) return false
  }
  if (typeof p.claimedByStaff !== 'boolean') return false
  return true
}

function loadPassport(): PassportState {
  try {
    const raw = localStorage.getItem(PASSPORT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (isValidPassport(parsed)) {
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
    // Jika email ini sebelumnya sudah mengklaim Pin di perangkat ini, pertahankan status claimedByStaff
    const emailKey = p.email.trim().toLowerCase()
    if (emailKey && readClaimedEmails().includes(emailKey)) {
      setPassportState((prev) => {
        if (prev.claimedByStaff) return prev
        const next: PassportState = {
          ...prev,
          claimedByStaff: true,
          claimedAt: prev.claimedAt ?? new Date().toISOString(),
        }
        persistPassport(next)
        return next
      })
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
        if (player) {
          const updatedPlayer: Player = { ...player, email: trimmedEmail, consent: true }
          setState(updatedPlayer)
          try {
            localStorage.setItem(KEY, JSON.stringify(updatedPlayer))
            sessionStorage.setItem(KEY, JSON.stringify(updatedPlayer))
          } catch {
            /* abaikan */
          }
          void saveLead(updatedPlayer, 'passport-naii-account')
        } else {
          // Jangan tulis player placeholder agar RequirePlayer tetap meminta nama & instansi asli sebelum main game.
          void saveLead(
            { name: 'Delegasi CIFP', institution: 'CIFP 2026', email: trimmedEmail, consent: true },
            'passport-naii-account',
          )
        }
      }
    },
    [player],
  )

  const markTicketClaimed = useCallback(() => {
    recordClaimedEmail(player?.email)
    setPassportState((prev) => {
      const next: PassportState = {
        ...prev,
        claimedByStaff: true,
        claimedAt: new Date().toISOString(),
      }
      persistPassport(next)
      return next
    })
  }, [player?.email])

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
