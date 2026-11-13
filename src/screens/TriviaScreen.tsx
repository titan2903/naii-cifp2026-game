import { useMemo } from 'react'
import { RequirePlayer } from '../components/PlayerGate'
import { QuizGame, type QuizConfig } from '../components/QuizGame'
import { useLanguage } from '../context/LanguageContext'
import { getTriviaQuestions } from '../data/trivia'

export function TriviaScreen() {
  const { lang } = useLanguage()
  const en = lang === 'en'

  const config: QuizConfig = useMemo(
    () => ({
      game: 'trivia',
      title: en
        ? 'Speed Trivia: Independent-Active, Next World Order & AI'
        : 'Speed Trivia: Bebas-Aktif, Next World Order & AI',
      badge: en
        ? 'INSTRUMENT 02 // 5 RANDOM QUESTIONS FROM 15 BANK ITEMS · 12 SEC/Q'
        : 'INSTRUMEN 02 // 5 SOAL ACAK DARI 15 BANK SOAL · 12 DETIK/SOAL',
      description: en
        ? 'Test your mastery of 10 Years of CIFP 2026, Indonesia’s Independent & Active Foreign Policy doctrine, AI Geopolitics, the Personal Data Protection Law (UU PDP), and Nusantara AI Institute.'
        : 'Adu wawasan seputar 10 Tahun CIFP 2026, doktrin Politik Luar Negeri Bebas-Aktif, Geopolitik AI, UU PDP, dan ekosistem Nusantara AI Institute.',
      rules: en
        ? [
            '5 questions are randomly drawn from the 15 official bank items (3 categories: CIFP & Bebas-Aktif, AI Geopolitics, Indonesia & NAII).',
            'You have 12 seconds per question. Each correct answer earns 100 base points + up to 50 speed bonus points.',
            'Maximum score is 750 points — recorded live on the active break-session Leaderboard.',
          ]
        : [
            '5 pertanyaan dipilih acak dari 15 bank soal resmi (3 kategori: CIFP & Bebas-Aktif, Geopolitik AI, Indonesia & NAII).',
            'Waktu menjawab 12 detik per soal. Jawaban benar = 100 poin dasar + bonus kecepatan hingga 50 poin.',
            'Skor maksimal 750 poin — langsung tercatat pada Live Leaderboard sesi break aktif.',
          ],
      pool: getTriviaQuestions(lang),
      questionsPerRound: 5,
      secondsPerQuestion: 12,
      layout: 'grid',
    }),
    [en, lang],
  )

  return (
    <RequirePlayer
      title="Speed Trivia: Geopolitics × AI"
      subtitle={
        en
          ? 'Enter your name & university/institution so your score is recorded on the NAII Live Booth Leaderboard.'
          : 'Masukkan nama & kampus/instansi Anda agar skor tercatat di Live Leaderboard Booth NAII.'
      }
    >
      <QuizGame config={config} />
    </RequirePlayer>
  )
}
