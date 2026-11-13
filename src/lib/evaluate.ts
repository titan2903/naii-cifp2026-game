import type { Lang } from '../context/LanguageContext'
import { personaFromScore } from '../data/personas'
import type { Dimensions, Scenario, ScenarioOption, SimulationResult } from '../types'

/**
 * Mesin analisis Crisis Simulator (rule-based, berjalan 100% offline di browser).
 * Skor dasar berasal dari opsi kebijakan yang dipilih; instruksi tambahan pengunjung
 * dianalisis dengan kata kunci kebijakan (Indonesia & Inggris) untuk bonus/penalti per dimensi.
 */

interface KeywordGroup {
  dim: keyof Dimensions
  words: string[]
}

const POSITIVE: KeywordGroup[] = [
  {
    dim: 'bebas',
    words: [
      'netral',
      'neutral',
      'mandiri',
      'kemandirian',
      'autonomy',
      'kedaulatan',
      'sovereignty',
      'sovereign',
      'berdaulat',
      'independen',
      'independent',
      'tidak memihak',
      'non-blok',
      'nonblok',
      'non-aligned',
      'kepentingan nasional',
      'national interest',
      'seimbang',
      'balanced',
      'bebas-aktif',
    ],
  },
  {
    dim: 'aktif',
    words: [
      'asean',
      'global south',
      'pbb',
      'united nations',
      'multilateral',
      'dialog',
      'dialogue',
      'kerja sama',
      'kerjasama',
      'cooperation',
      'koalisi',
      'coalition',
      'perdamaian',
      'peace',
      'de-eskalasi',
      'deeskalasi',
      'de-escalation',
      'mediasi',
      'mediation',
      'jembatan',
      'bridge',
      'inklusif',
      'inclusive',
      'kolaborasi',
      'collaboration',
      'diplomasi',
      'diplomacy',
      'konsensus',
      'consensus',
    ],
  },
  {
    dim: 'teknologi',
    words: [
      'talenta',
      'talent',
      'literasi',
      'literacy',
      'etika',
      'ethics',
      'pdp',
      'data',
      'open-source',
      'open source',
      'riset',
      'research',
      'pendidikan',
      'education',
      'transfer',
      'verifikasi',
      'verification',
      'watermark',
      'watermarking',
      'standar',
      'standard',
      'regulasi',
      'regulation',
      'privasi',
      'privacy',
      'keamanan siber',
      'cybersecurity',
      'sdm',
    ],
  },
]

const NEGATIVE = [
  'bergabung dengan blok',
  'pilih blok',
  'memilih blok',
  'join bloc',
  'pick a bloc',
  'embargo',
  'serang',
  'attack',
  'serangan balasan',
  'retaliation',
  'balas dendam',
  'putus hubungan',
  'sever ties',
  'ancam',
  'threaten',
  'perang dagang',
  'trade war',
]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const has = (text: string, word: string) => new RegExp(`(^|[^a-z0-9])${escape(word)}([^a-z0-9]|$)`, 'i').test(text)

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

export function evaluateDecision(
  scenario: Scenario,
  option: ScenarioOption,
  customNote: string,
  lang: Lang = 'id',
): SimulationResult {
  const note = customNote.trim().toLowerCase()
  const dims: Dimensions = { ...option.dims }
  const matchedKeywords: string[] = []
  const penalties: string[] = []

  if (note.length >= 2) {
    for (const group of POSITIVE) {
      const hits = group.words.filter((w) => has(note, w))
      matchedKeywords.push(...hits)
      dims[group.dim] += Math.min(hits.length, 3) * 4 // maks +12 per dimensi
    }
    for (const w of NEGATIVE) {
      if (has(note, w)) {
        penalties.push(w)
        dims.bebas -= 10
        dims.aktif -= 6
      }
    }
  }

  dims.bebas = clamp(dims.bebas)
  dims.aktif = clamp(dims.aktif)
  dims.teknologi = clamp(dims.teknologi)

  const score = clamp((dims.bebas + dims.aktif + dims.teknologi) / 3)

  return {
    scenario,
    option,
    customNote: customNote.trim(),
    dims,
    score,
    persona: personaFromScore(score, lang),
    matchedKeywords: [...new Set(matchedKeywords)],
    penalties,
  }
}
