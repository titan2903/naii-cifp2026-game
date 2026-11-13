import type { Persona, PersonaId } from '../types'

export const NAII_URL = 'https://www.naii.co'

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
    accent: '#B47B2A',
  },
  'pragmatic-negotiator': {
    id: 'pragmatic-negotiator',
    title: 'The Pragmatic Negotiator',
    range: '< 70',
    tagline: 'Fokus pada stabilitas — siap naik level dengan literasi AI.',
    description:
      'Mengutamakan stabilitas jangka pendek dan hasil yang realistis. Perkuat strategi pemanfaatan teknologi jangka panjang untuk jadi diplomat masa depan.',
    courses: ['Pengenalan AI untuk Pelajar dan Generasi Muda', 'Storytelling dan Visualisasi Data dengan AI'],
    accent: '#0F766E',
  },
}

export function personaFromScore(score: number): Persona {
  if (score >= 85) return PERSONAS['bridge-builder']
  if (score >= 70) return PERSONAS['sovereign-guardian']
  return PERSONAS['pragmatic-negotiator']
}

/** Rekomendasi kursus setelah kuis, berdasarkan persentase skor. */
export function coursesForQuiz(ratio: number): string[] {
  if (ratio >= 0.8) return ['Kepemimpinan AI dan Pengambilan Keputusan untuk Eksekutif', 'Etika AI dari Perspektif Indonesia']
  if (ratio >= 0.5) return ['AI dalam Akademik untuk Pelajar dan Mahasiswa', 'AI untuk Pencari Kerja']
  return ['Pengenalan AI untuk Pelajar dan Generasi Muda', 'Etika AI dari Perspektif Indonesia']
}
