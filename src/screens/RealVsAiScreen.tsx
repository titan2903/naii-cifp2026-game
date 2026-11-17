import { useMemo } from 'react'
import { RequirePlayer } from '../components/PlayerGate'
import { QuizGame, type QuizConfig } from '../components/QuizGame'
import { useLanguage } from '../context/LanguageContext'
import { getRealVsAiStatements } from '../data/realVsAi'

export function RealVsAiScreen() {
  const { lang } = useLanguage()
  const en = lang === 'en'

  const config: QuizConfig = useMemo(
    () => ({
      game: 'realvsai',
      title: 'Real Diplomacy or AI Hallucination?',
      badge: en
        ? 'GAME 02 // ARCHIVAL FACT VS AI HALLUCINATION · 10 SEC/CLAIM'
        : 'GAME 02 // VERIFIKASI ARSIP VS HALUSINASI AI · 10 DETIK/KLAIM',
      description: en
        ? 'In an era of synthetic disinformation, can you distinguish authentic diplomatic history and binding international treaties from plausible-sounding AI hallucinations?'
        : 'Di era disinformasi sintetis, mampukah Anda membedakan fakta sejarah dan traktat diplomasi internasional yang sah dari kutipan fabrikasi (halusinasi) AI?',
      rules: en
        ? [
            '5 claims appear at random — verify whether each is a DIPLOMATIC FACT or an AI HALLUCINATION.',
            '10-second verification window per claim (100 base points + up to 50 speed bonus points).',
            'Every claim includes an immediate archival fact-check and posts your score to the Live Leaderboard.',
          ]
        : [
            '5 pernyataan tampil secara acak — verifikasi apakah FAKTA DIPLOMASI atau HALUSINASI AI.',
            'Waktu verifikasi 10 detik per pernyataan (100 poin dasar + hingga 50 poin bonus kecepatan).',
            'Setiap klaim langsung dilengkapi rujukan fakta edukasi dan masuk ke Live Leaderboard.',
          ],
      pool: getRealVsAiStatements(lang),
      questionsPerRound: 5,
      secondsPerQuestion: 10,
      layout: 'binary',
    }),
    [en, lang],
  )

  return (
    <RequirePlayer
      title="Real Diplomacy or AI Hallucination?"
      subtitle={
        en
          ? 'Enter your name & institution to test your AI verification sharpness and record your score.'
          : 'Masukkan nama & instansi Anda untuk menguji ketajaman verifikasi literasi AI dan mencatatkan skor.'
      }
    >
      <QuizGame config={config} />
    </RequirePlayer>
  )
}
