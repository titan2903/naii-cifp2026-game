import type { Lang } from '../context/LanguageContext'

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickRandom<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

/** UUID v4 — fallback jika crypto.randomUUID tidak tersedia (mis. diakses via http://IP-LAN). */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const SESSION_TAGS = ['Break Pagi', 'Break Siang', 'Break Sore'] as const

export type SessionTag = (typeof SESSION_TAGS)[number]

/** Label sesi break diselaraskan dengan rundown resmi cifp.center (CIFP 2026 WIB):
 *  - Break 1 (Pagi): 11:25–12:00 WIB (setelah Opening Plenary 09:30–11:25) -> s.d. 12:05
 *  - Break 2 (Siang): 13:15–14:00 WIB (setelah Session 1 12:00–13:15) -> 12:05–14:05
 *  - Break 3 (Sore): 15:15–16:00 WIB (setelah Session 2 14:00–15:15, hingga Closing 19:25) -> >= 14:05 */
export function currentSessionTag(date = new Date()): SessionTag {
  const minutes = date.getHours() * 60 + date.getMinutes()
  if (minutes < 12 * 60 + 5) return 'Break Pagi'
  if (minutes < 14 * 60 + 5) return 'Break Siang'
  return 'Break Sore'
}

const SESSION_WINDOW_MAP: Record<string, { full: string; short: string }> = {
  'Break Pagi': { full: '11:25–12:00 WIB', short: '11:25' },
  'Break Siang': { full: '13:15–14:00 WIB', short: '13:15' },
  'Break Sore': { full: '15:15–16:00 WIB', short: '15:15' },
}

export function formatSessionWindow(tag: string, compact = false): string {
  const entry = SESSION_WINDOW_MAP[tag]
  if (!entry) return ''
  return compact ? entry.short : entry.full
}

const SESSION_EN_MAP: Record<string, string> = {
  'Break Pagi': 'Morning Break',
  'Break Siang': 'Midday Break',
  'Break Sore': 'Afternoon Break',
}

export function formatSessionTag(tag: string, lang: Lang = 'id'): string {
  if (lang === 'en') return SESSION_EN_MAP[tag] ?? tag
  return tag
}

export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatSeconds(s: number, lang: Lang = 'id'): string {
  const safe = typeof s === 'number' && Number.isFinite(s) ? Math.max(0, s) : 0
  return lang === 'en' ? `${safe.toFixed(1)}s` : `${safe.toFixed(1)} dtk`
}

export function formatStampScore(gameLabel?: string, score?: number): string {
  if (score == null) return ''
  return gameLabel?.startsWith('Simulator') ? `${score}/100` : `${score} PTS`
}
