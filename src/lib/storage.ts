import { supabase } from './supabase'
import { SESSION_TAGS, startOfToday, uuid } from './utils'
import type { NewScore, Player, ScoreEntry, SimulationResult } from '../types'

/**
 * Lapisan data hybrid (online-first, offline-fallback):
 * - Semua skor selalu disimpan ke localStorage dulu (tidak pernah hilang meski sinyal Kasablanka Hall drop).
 * - Bila Supabase aktif → dikirim ke cloud; jika gagal, masuk antrean "pending" dan dikirim ulang otomatis.
 */

const LS_SCORES = 'naii-cifp26:scores'
const LS_PENDING = 'naii-cifp26:pending'
const LS_LEADS = 'naii-cifp26:leads-sent'
const LS_PENDING_LEADS = 'naii-cifp26:pending-leads'
const LOCAL_EVENT = 'naii-cifp26:score-added'

const VALID_GAMES = new Set<string>(['trivia', 'realvsai', 'battle'])
const VALID_SESSIONS = new Set<string>(SESSION_TAGS)
const EMAIL_RE = /^[^\s@]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/

/** Validasi integritas skor untuk mencegah manipulasi localStorage / payload API tidak wajar. */
export function isValidScoreEntry(raw: unknown): raw is ScoreEntry {
  if (!raw || typeof raw !== 'object') return false
  const s = raw as ScoreEntry
  if (typeof s.id !== 'string' || s.id.trim().length < 4) return false
  if (typeof s.player_name !== 'string' || s.player_name.trim().length < 2 || s.player_name.length > 60) return false
  if (typeof s.institution !== 'string' || s.institution.length > 80) return false
  if (!VALID_GAMES.has(s.game)) return false
  if (!VALID_SESSIONS.has(s.session_tag)) return false
  if (!Number.isInteger(s.total_questions) || s.total_questions !== 5) return false
  if (!Number.isInteger(s.correct_count) || s.correct_count < 0 || s.correct_count > s.total_questions) return false
  if (!Number.isInteger(s.score) || s.score < s.correct_count * 100 || s.score > s.correct_count * 150) return false
  if (typeof s.time_seconds !== 'number' || !Number.isFinite(s.time_seconds) || s.time_seconds < 0.5 || s.time_seconds > 300) {
    return false
  }
  if (typeof s.created_at !== 'string' || Number.isNaN(Date.parse(s.created_at))) return false
  return true
}

interface PendingLead {
  player_name: string
  institution: string
  email: string
  consent: true
  source: string
}

export const backendMode: 'supabase' | 'local' = supabase ? 'supabase' : 'local'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage penuh / mode privat — abaikan */
  }
}

function saveLocal(entry: ScoreEntry) {
  const all = readJson<ScoreEntry[]>(LS_SCORES, [])
  all.push(entry)
  writeJson(LS_SCORES, all.slice(-1000))
}

function getPending(): ScoreEntry[] {
  return readJson<ScoreEntry[]>(LS_PENDING, [])
}

function setPending(list: ScoreEntry[]) {
  writeJson(LS_PENDING, list)
}

let flushingPromise: Promise<void> | null = null
let flushingLeadsPromise: Promise<void> | null = null

export async function flushPendingLeads(): Promise<void> {
  if (!supabase) return
  if (flushingLeadsPromise) return flushingLeadsPromise
  flushingLeadsPromise = (async () => {
    const client = supabase
    if (!client) return
    const queue = readJson<PendingLead[]>(LS_PENDING_LEADS, [])
    if (!queue.length) return
    const succeededKeys = new Set<string>()
    const invalidKeys = new Set<string>()
    for (const item of queue) {
      const emailKey = typeof item?.email === 'string' ? item.email.trim().toLowerCase() : ''
      if (!emailKey || !EMAIL_RE.test(emailKey) || typeof item.player_name !== 'string' || item.player_name.trim().length < 2) {
        invalidKeys.add(emailKey)
        continue
      }
      const { error } = await client.from('leads').insert({ ...item, email: emailKey })
      if (!error) {
        succeededKeys.add(emailKey)
      }
    }
    if (!succeededKeys.size && !invalidKeys.size) return
    if (succeededKeys.size > 0) {
      const latestSent = new Set(readJson<string[]>(LS_LEADS, []).map((e) => e.trim().toLowerCase()))
      for (const k of succeededKeys) latestSent.add(k)
      writeJson(LS_LEADS, [...latestSent])
    }
    const latestQueue = readJson<PendingLead[]>(LS_PENDING_LEADS, [])
    writeJson(
      LS_PENDING_LEADS,
      latestQueue.filter((item) => {
        const k = typeof item?.email === 'string' ? item.email.trim().toLowerCase() : ''
        return Boolean(k) && !succeededKeys.has(k) && !invalidKeys.has(k)
      }),
    )
  })().finally(() => {
    flushingLeadsPromise = null
  })
  return flushingLeadsPromise
}

export async function flushPending(): Promise<void> {
  if (!supabase) return
  if (flushingPromise) return flushingPromise
  flushingPromise = (async () => {
    const client = supabase
    if (!client) return
    const pending = getPending().filter(isValidScoreEntry)
    if (pending.length) {
      const flushedIds = new Set(pending.map((p) => p.id))
      const { error } = await client.from('leaderboard').upsert(pending, { onConflict: 'id', ignoreDuplicates: true })
      if (!error) {
        setPending(getPending().filter(isValidScoreEntry).filter((p) => !flushedIds.has(p.id)))
      }
    } else {
      setPending([])
    }
    await flushPendingLeads()
  })().finally(() => {
    flushingPromise = null
  })
  return flushingPromise
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flushPending())
}

export async function submitScore(score: NewScore): Promise<ScoreEntry> {
  const safeTotal = 5
  const safeCorrect = Math.max(0, Math.min(safeTotal, Math.round(score.correct_count)))
  const minScore = safeCorrect * 100
  const maxScore = safeCorrect * 150
  const safeScore = Math.max(minScore, Math.min(maxScore, Math.round(score.score)))
  const safeTime =
    typeof score.time_seconds === 'number' && Number.isFinite(score.time_seconds)
      ? Math.max(0.5, Math.min(300, Math.round(score.time_seconds * 10) / 10))
      : 50

  const entry: ScoreEntry = {
    ...score,
    player_name: score.player_name.trim().slice(0, 40) || 'Delegasi CIFP',
    institution: score.institution.trim().slice(0, 60) || 'Umum',
    correct_count: safeCorrect,
    total_questions: safeTotal,
    score: safeScore,
    time_seconds: safeTime,
    id: uuid(),
    created_at: new Date().toISOString(),
  }
  saveLocal(entry)
  window.dispatchEvent(new CustomEvent<ScoreEntry>(LOCAL_EVENT, { detail: entry }))

  if (supabase) {
    try {
      const { error } = await supabase.from('leaderboard').insert(entry)
      if (error) throw error
      void flushPending()
    } catch {
      setPending([...getPending().filter(isValidScoreEntry), entry])
    }
  }
  return entry
}

/**
 * Mengurutkan skor tertinggi & waktu tercepat, sekaligus mendeduplikasi per delegasi per sesi
 * agar 1 orang tidak bisa memborong Peringkat #1, #2, dan #3 sekaligus di sesi break yang sama.
 */
export function sortScores(list: ScoreEntry[], dedupeByPlayer = true): ScoreEntry[] {
  const valid = list.filter(isValidScoreEntry)
  const sorted = [...valid].sort(
    (a, b) => b.score - a.score || a.time_seconds - b.time_seconds || a.created_at.localeCompare(b.created_at),
  )
  if (!dedupeByPlayer) return sorted
  const seen = new Set<string>()
  return sorted.filter((entry) => {
    const key = `${entry.session_tag}::${entry.player_name.trim().toLowerCase()}::${entry.institution.trim().toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Seluruh skor delegasi hari ini (cloud + pending lokal, atau lokal saja). */
export async function fetchTodayScores(): Promise<ScoreEntry[]> {
  const todayIso = startOfToday().toISOString()
  const localScores = readJson<ScoreEntry[]>(LS_SCORES, []).filter(
    (e) => isValidScoreEntry(e) && e.created_at >= todayIso,
  )

  if (!supabase) return localScores

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, player_name, institution, game, score, correct_count, total_questions, time_seconds, session_tag, created_at')
      .gte('created_at', todayIso)
      .order('score', { ascending: false })
      .limit(1000)
    if (error) throw error
    const byId = new Map<string, ScoreEntry>()
    for (const e of data as ScoreEntry[]) {
      if (isValidScoreEntry(e)) byId.set(e.id, e)
    }
    for (const e of getPending()) {
      if (isValidScoreEntry(e) && e.created_at >= todayIso) byId.set(e.id, e)
    }
    return [...byId.values()]
  } catch {
    return localScores
  }
}

/** Langganan skor baru: Supabase Realtime (lintas perangkat) + event lokal (perangkat yang sama / tab lain). */
export function subscribeScores(onInsert: (entry: ScoreEntry) => void): () => void {
  const safeEmit = (entry: unknown) => {
    if (isValidScoreEntry(entry)) onInsert(entry)
  }
  const onLocal = (e: Event) => safeEmit((e as CustomEvent<ScoreEntry>).detail)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== LS_SCORES || !e.newValue) return
    try {
      const list = JSON.parse(e.newValue) as unknown[]
      if (!Array.isArray(list)) return
      const last = list[list.length - 1]
      safeEmit(last)
    } catch {
      /* abaikan payload storage korup dari tab lain */
    }
  }
  window.addEventListener(LOCAL_EVENT, onLocal)
  window.addEventListener('storage', onStorage)

  const channel = supabase
    ?.channel('leaderboard-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leaderboard' }, (payload) =>
      safeEmit(payload.new),
    )
    .subscribe()

  return () => {
    window.removeEventListener(LOCAL_EVENT, onLocal)
    window.removeEventListener('storage', onStorage)
    if (channel && supabase) void supabase.removeChannel(channel)
  }
}

/** Data kontak hanya dikirim bila ada email + persetujuan (UU PDP). Tabel leads bersifat insert-only + retry offline. */
export async function saveLead(player: Player, source: string): Promise<void> {
  if (!player.email || !player.consent) return
  const key = player.email.trim().toLowerCase()
  const sent = readJson<string[]>(LS_LEADS, [])
  if (sent.includes(key)) return

  const payload: PendingLead = {
    player_name: player.name,
    institution: player.institution,
    email: key,
    consent: true,
    source,
  }

  if (!supabase) {
    const queue = readJson<PendingLead[]>(LS_PENDING_LEADS, [])
    if (!queue.some((item) => item.email === key)) {
      writeJson(LS_PENDING_LEADS, [...queue, payload])
    }
    return
  }

  try {
    const { error } = await supabase.from('leads').insert(payload)
    if (error) throw error
    writeJson(LS_LEADS, [...sent, key])
    void flushPendingLeads()
  } catch {
    const queue = readJson<PendingLead[]>(LS_PENDING_LEADS, [])
    if (!queue.some((item) => item.email === key)) {
      writeJson(LS_PENDING_LEADS, [...queue, payload])
    }
  }
}

export async function savePersona(player: Player, r: SimulationResult): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('diplomat_personas').insert({
      player_name: player.name,
      institution: player.institution,
      scenario_id: r.scenario.id,
      option_id: r.option.id,
      persona_title: r.persona.title,
      diplomacy_score: r.score,
      custom_note: r.customNote.slice(0, 280) || null,
    })
  } catch {
    /* non-kritis: kartu persona tetap tampil walau gagal tersimpan */
  }
}
