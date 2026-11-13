import { RequirePlayer } from '../components/PlayerGate'
import { QuizGame, type QuizConfig } from '../components/QuizGame'
import { REAL_VS_AI_STATEMENTS } from '../data/realVsAi'

const REAL_VS_AI_CONFIG: QuizConfig = {
  game: 'realvsai',
  title: 'Real Diplomacy or AI Hallucination?',
  badge: 'INSTRUMEN 03 // VERIFIKASI ARSIP VS HALUSINASI AI · 10 DETIK/KLAIM',
  description:
    'Di era disinformasi sintetis, mampukah Anda membedakan fakta sejarah dan traktat diplomasi internasional yang sah dari kutipan fabrikasi (halusinasi) AI?',
  rules: [
    '5 pernyataan tampil secara acak — verifikasi apakah FAKTA DIPLOMASI atau HALUSINASI AI.',
    'Waktu verifikasi 10 detik per pernyataan (100 poin dasar + hingga 50 poin bonus kecepatan).',
    'Setiap klaim langsung dilengkapi rujukan fakta edukasi dan masuk ke Live Leaderboard.',
  ],
  pool: REAL_VS_AI_STATEMENTS,
  questionsPerRound: 5,
  secondsPerQuestion: 10,
  layout: 'binary',
}

export function RealVsAiScreen() {
  return (
    <RequirePlayer
      title="Real Diplomacy or AI Hallucination?"
      subtitle="Masukkan nama & instansi Anda untuk menguji ketajaman verifikasi literasi AI dan mencatatkan skor."
    >
      <QuizGame config={REAL_VS_AI_CONFIG} />
    </RequirePlayer>
  )
}
