import { supabase } from './supabase'
import { uuid } from './utils'
import type { NewScore, Player, ScoreEntry, SimulationResult } from '../types'

/**
 * Lapisan data hybrid (online-first, offline-fallback):
 * - Semua skor selalu disimpan ke localStorage dulu (tidak pernah hilang meski sinyal Kasablanka Hall drop).
 * - Bila Supabase aktif → dikirim ke cloud; jika gagal, masuk antrean "pending" dan dikirim ulang otomatis.
 */

const LS_SCORES = 'naii-cifp26:scores'
const LS_PENDING = 'naii-cifp26:pending'
const LS_LEADS = 'naii-cifp26:leads-sent'
const LOCAL_EVENT = 'naii-cifp26:score-added'

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

export async function flushPending(): Promise<void> {
  if (!supabase) return
  const pending = getPending()
  if (!pending.length) return
  const { error } = await supabase.from('leaderboard').upsert(pending, { onConflict: 'id', ignoreDuplicates: true })
  if (!error) setPending([])
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flushPending())
}

export async function submitScore(score: NewScore): Promise<ScoreEntry> {
  const entry: ScoreEntry = { ...score, id: uuid(), created_at: new Date().toISOString() }
  saveLocal(entry)
  window.dispatchEvent(new CustomEvent<ScoreEntry>(LOCAL_EVENT, { detail: entry }))

  if (supabase) {
    try {
      const { error } = await supabase.from('leaderboard').insert(entry)
      if (error) throw error
      void flushPending()
    } catch {
      setPending([...getPending(), entry])
    }
  }
  return entry
}

export function sortScores(list: ScoreEntry[]): ScoreEntry[] {
  return [...list].sort(
    (a, b) => b.score - a.score || a.time_seconds - b.time_seconds || a.created_at.localeCompare(b.created_at),
  )
}

/** Seluruh skor delegasi (cloud + pending lokal, atau lokal saja). */
export async function fetchTodayScores(): Promise<ScoreEntry[]> {
  const localScores = readJson<ScoreEntry[]>(LS_SCORES, [])

  if (!supabase) return localScores

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, player_name, institution, game, score, correct_count, total_questions, time_seconds, session_tag, created_at')
      .order('score', { ascending: false })
      .limit(1000)
    if (error) throw error
    const byId = new Map<string, ScoreEntry>()
    for (const e of data as ScoreEntry[]) byId.set(e.id, e)
    for (const e of getPending()) byId.set(e.id, e)
    return [...byId.values()]
  } catch {
    return localScores
  }
}

/** Langganan skor baru: Supabase Realtime (lintas perangkat) + event lokal (perangkat yang sama / tab lain). */
export function subscribeScores(onInsert: (entry: ScoreEntry) => void): () => void {
  const onLocal = (e: Event) => onInsert((e as CustomEvent<ScoreEntry>).detail)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== LS_SCORES || !e.newValue) return
    const list = JSON.parse(e.newValue) as ScoreEntry[]
    const last = list[list.length - 1]
    if (last) onInsert(last)
  }
  window.addEventListener(LOCAL_EVENT, onLocal)
  window.addEventListener('storage', onStorage)

  const channel = supabase
    ?.channel('leaderboard-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leaderboard' }, (payload) =>
      onInsert(payload.new as ScoreEntry),
    )
    .subscribe()

  return () => {
    window.removeEventListener(LOCAL_EVENT, onLocal)
    window.removeEventListener('storage', onStorage)
    if (channel && supabase) void supabase.removeChannel(channel)
  }
}

/** Data kontak hanya dikirim bila ada email + persetujuan (UU PDP). Tabel leads bersifat insert-only. */
export async function saveLead(player: Player, source: string): Promise<void> {
  if (!supabase || !player.email || !player.consent) return
  const sent = readJson<string[]>(LS_LEADS, [])
  const key = player.email.toLowerCase()
  if (sent.includes(key)) return
  const { error } = await supabase.from('leads').insert({
    player_name: player.name,
    institution: player.institution,
    email: key,
    consent: true,
    source,
  })
  if (!error) writeJson(LS_LEADS, [...sent, key])
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
