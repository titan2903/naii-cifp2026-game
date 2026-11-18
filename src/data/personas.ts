import type { Lang } from '../context/LanguageContext'
import type { Persona, PersonaId } from '../types'

export const NAII_URL = 'https://www.naii.co'
export const BOOTH_GAME_URL = 'https://naii-cifp2026-game.vercel.app/'

export const PERSONAS: Record<PersonaId, Persona> = {
  'bridge-builder': {
    id: 'bridge-builder',
    title: 'The Techno-Bridge Builder',
    range: '85–100',
    tagline: 'Menjembatani dunia dengan teknologi, tanpa kehilangan kemandirian.',
    description:
      'Piawai menjaga kemandirian Indonesia sambil merangkul semua pihak dengan solusi berbasis teknologi. Anda adalah wajah diplomasi Bebas-Aktif 2.0.',
    courses: ['Kepemimpinan AI dan Pengambilan Keputusan untuk Eksekutif', 'Etika AI dari Perspektif Indonesia'],
    accent: '#AD2B17',
  },
  'sovereign-guardian': {
    id: 'sovereign-guardian',
    title: 'The Sovereign Guardian',
    range: '70–84',
    tagline: 'Penjaga kedaulatan bangsa di era data dan algoritma.',
    description:
      'Tegas menjaga kepentingan nasional, regulasi data, dan kemandirian bangsa di tengah tekanan global. Kekuatan Anda: prinsip yang kokoh.',
    courses: ['Etika AI dari Perspektif Indonesia', 'AI dalam Akademik untuk Pelajar dan Mahasiswa'],
    accent: '#AD2B17',
  },
  'pragmatic-negotiator': {
    id: 'pragmatic-negotiator',
    title: 'The Pragmatic Negotiator',
    range: '< 70',
    tagline: 'Fokus pada stabilitas — siap naik level dengan literasi AI.',
    description:
      'Mengutamakan stabilitas jangka pendek dan hasil yang realistis. Perkuat strategi pemanfaatan teknologi jangka panjang untuk jadi diplomat masa depan.',
    courses: ['Pengenalan AI untuk Pelajar dan Generasi Muda', 'Storytelling dan Visualisasi Data dengan AI'],
    accent: '#AD2B17',
  },
}

export const PERSONAS_EN: Record<PersonaId, Persona> = {
  'bridge-builder': {
    id: 'bridge-builder',
    title: 'The Techno-Bridge Builder',
    range: '85–100',
    tagline: 'Bridging global divides through technology without compromising national autonomy.',
    description:
      'Adept at safeguarding Indonesia’s strategic autonomy while engaging all poles with technology-driven solutions. You embody Independent & Active Diplomacy 2.0.',
    courses: ['AI Leadership & Decision-Making for Executives', 'AI Ethics from an Indonesian Perspective'],
    accent: '#AD2B17',
  },
  'sovereign-guardian': {
    id: 'sovereign-guardian',
    title: 'The Sovereign Guardian',
    range: '70–84',
    tagline: 'Steward of national sovereignty in the age of data and algorithms.',
    description:
      'Resolute in defending national interests, data governance, and technological autonomy amid geopolitical rivalry. Your core strength is unwavering principle.',
    courses: ['AI Ethics from an Indonesian Perspective', 'AI in Academia for Students & Researchers'],
    accent: '#AD2B17',
  },
  'pragmatic-negotiator': {
    id: 'pragmatic-negotiator',
    title: 'The Pragmatic Negotiator',
    range: '< 70',
    tagline: 'Focused on immediate stability — ready to level up with AI literacy.',
    description:
      'Prioritizes near-term stability and realistic outcomes. Sharpen your long-term technological strategy to become a future-ready diplomat.',
    courses: ['Introduction to AI for Students & Youth', 'Data Storytelling and Visualization with AI'],
    accent: '#AD2B17',
  },
}

export function getPersonas(lang: Lang = 'id'): Record<PersonaId, Persona> {
  return lang === 'en' ? PERSONAS_EN : PERSONAS
}

export function personaFromScore(score: number, lang: Lang = 'id'): Persona {
  const dict = getPersonas(lang)
  if (score >= 85) return dict['bridge-builder']
  if (score >= 70) return dict['sovereign-guardian']
  return dict['pragmatic-negotiator']
}

/** Rekomendasi kursus setelah kuis, berdasarkan persentase skor. */
export function coursesForQuiz(ratio: number, lang: Lang = 'id'): string[] {
  if (lang === 'en') {
    if (ratio >= 0.8) return ['AI Leadership & Decision-Making for Executives', 'AI Ethics from an Indonesian Perspective']
    if (ratio >= 0.5) return ['AI in Academia for Students & Researchers', 'AI for Job Seekers & Career Readiness']
    return ['Introduction to AI for Students & Youth', 'AI Ethics from an Indonesian Perspective']
  }
  if (ratio >= 0.8) return ['Kepemimpinan AI dan Pengambilan Keputusan untuk Eksekutif', 'Etika AI dari Perspektif Indonesia']
  if (ratio >= 0.5) return ['AI dalam Akademik untuk Pelajar dan Mahasiswa', 'AI untuk Pencari Kerja']
  return ['Pengenalan AI untuk Pelajar dan Generasi Muda', 'Etika AI dari Perspektif Indonesia']
}
