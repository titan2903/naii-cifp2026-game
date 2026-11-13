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

/** Label sesi break berdasarkan jam lokal — dipakai untuk "Top 3 per sesi". */
export function currentSessionTag(date = new Date()): string {
  const h = date.getHours()
  if (h < 12) return 'Break Pagi'
  if (h < 15) return 'Break Siang'
  return 'Break Sore'
}

export const SESSION_TAGS = ['Break Pagi', 'Break Siang', 'Break Sore'] as const

export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatSeconds(s: number): string {
  return `${s.toFixed(1)} dtk`
}
