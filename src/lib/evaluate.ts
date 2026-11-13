import { personaFromScore } from '../data/personas'
import type { Dimensions, Scenario, ScenarioOption, SimulationResult } from '../types'

/**
 * Mesin analisis Crisis Simulator (rule-based, berjalan 100% offline di browser).
 * Skor dasar berasal dari opsi kebijakan yang dipilih; instruksi tambahan pengunjung
 * dianalisis dengan kata kunci kebijakan untuk bonus/penalti per dimensi.
 *
 * Bisa diganti LLM (mis. Gemini via serverless function) tanpa mengubah UI —
 * cukup kembalikan objek SimulationResult yang sama.
 */

interface KeywordGroup {
  dim: keyof Dimensions
  words: string[]
}

const POSITIVE: KeywordGroup[] = [
  {
    dim: 'bebas',
    words: ['netral', 'mandiri', 'kemandirian', 'kedaulatan', 'berdaulat', 'independen', 'tidak memihak', 'non-blok', 'nonblok', 'kepentingan nasional', 'seimbang', 'bebas aktif', 'bebas-aktif'],
  },
  {
    dim: 'aktif',
    words: ['asean', 'global south', 'pbb', 'multilateral', 'dialog', 'kerja sama', 'kerjasama', 'koalisi', 'perdamaian', 'de-eskalasi', 'deeskalasi', 'mediasi', 'jembatan', 'inklusif', 'kolaborasi', 'diplomasi', 'konsensus'],
  },
  {
    dim: 'teknologi',
    words: ['talenta', 'literasi', 'etika', 'pdp', 'data', 'open-source', 'open source', 'riset', 'pendidikan', 'transfer', 'verifikasi', 'watermark', 'watermarking', 'standar', 'regulasi', 'privasi', 'keamanan siber', 'sdm', 'ai'],
  },
]

const NEGATIVE = ['bergabung dengan blok', 'pilih blok', 'memilih blok', 'embargo', 'serang', 'serangan balasan', 'balas dendam', 'putus hubungan', 'ancam', 'perang dagang']

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const has = (text: string, word: string) => new RegExp(`(^|[^a-z0-9])${escape(word)}([^a-z0-9]|$)`, 'i').test(text)

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

export function evaluateDecision(scenario: Scenario, option: ScenarioOption, customNote: string): SimulationResult {
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
    persona: personaFromScore(score),
    matchedKeywords: [...new Set(matchedKeywords)],
    penalties,
  }
}
