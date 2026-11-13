import { RequirePlayer } from '../components/PlayerGate'
import { QuizGame, type QuizConfig } from '../components/QuizGame'
import { TRIVIA_QUESTIONS } from '../data/trivia'

const TRIVIA_CONFIG: QuizConfig = {
  game: 'trivia',
  title: 'Speed Trivia: Bebas-Aktif, Next World Order & AI',
  badge: 'INSTRUMEN 02 // 5 SOAL ACAK DARI 15 BANK SOAL · 12 DETIK/SOAL',
  description:
    'Adu wawasan seputar 10 Tahun CIFP 2026, doktrin Politik Luar Negeri Bebas-Aktif, Geopolitik AI, UU PDP, dan ekosistem Nusantara AI Institute.',
  rules: [
    '5 pertanyaan dipilih acak dari 15 bank soal resmi (3 kategori: CIFP & Bebas-Aktif, Geopolitik AI, Indonesia & NAII).',
    'Waktu menjawab 12 detik per soal. Jawaban benar = 100 poin dasar + bonus kecepatan hingga 50 poin.',
    'Skor maksimal 750 poin — langsung tercatat pada Live Leaderboard sesi break aktif.',
  ],
  pool: TRIVIA_QUESTIONS,
  questionsPerRound: 5,
  secondsPerQuestion: 12,
  layout: 'grid',
}

export function TriviaScreen() {
  return (
    <RequirePlayer
      title="Speed Trivia: Geopolitics × AI"
      subtitle="Masukkan nama & kampus/instansi Anda agar skor tercatat di Live Leaderboard Booth NAII."
    >
      <QuizGame config={TRIVIA_CONFIG} />
    </RequirePlayer>
  )
}
