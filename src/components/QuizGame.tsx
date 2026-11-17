import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  FileCheck2,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  Stamp,
  Ticket,
  Trophy,
  XCircle,
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { usePlayer } from '../context/PlayerContext'
import { coursesForQuiz } from '../data/personas'
import { useCountdown } from '../hooks/useCountdown'
import { ROUTE_PATHS } from '../hooks/useHashRoute'
import { fetchTodayScores, sortScores, submitScore } from '../lib/storage'
import { currentSessionTag, formatSessionTag, pickRandom } from '../lib/utils'
import type { GameId, QuizItem, ScoreEntry } from '../types'
import { CourseCta } from './CourseCta'
import { TimerBar } from './TimerBar'

export interface QuizConfig {
  game: GameId
  title: string
  badge: string
  description: string
  rules: string[]
  pool: QuizItem[]
  questionsPerRound: number
  secondsPerQuestion: number
  layout: 'grid' | 'binary'
}

type Phase = 'intro' | 'question' | 'reveal' | 'result'

interface Answer {
  picked: number | null // null = waktu habis
  correct: boolean
  points: number
  elapsedMs: number
}

const BASE_POINTS = 100
const MAX_SPEED_BONUS = 50
const AUTO_ADVANCE_MS = 8500
const LETTERS = ['A', 'B', 'C', 'D']

export function QuizGame({ config }: { config: QuizConfig }) {
  const { player, unlockGameStamp, stampCount, passportOpen, setPassportOpen, qrModalOpen } = usePlayer()
  const { lang } = useLanguage()
  const en = lang === 'en'
  const durationMs = config.secondsPerQuestion * 1000

  const [phase, setPhase] = useState<Phase>('intro')
  const [roundIds, setRoundIds] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [entry, setEntry] = useState<ScoreEntry | null>(null)
  const [rank, setRank] = useState<number | null>(null)
  const answeredIndexRef = useRef<number>(-1)
  const roundIdRef = useRef<number>(0)
  const mountedRef = useRef<boolean>(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Resolve current round items from config.pool so switching ID <-> EN mid-round updates text immediately
  const round = useMemo(() => {
    const byId = new Map(config.pool.map((item) => [item.id, item]))
    return roundIds.map((id) => byId.get(id)).filter((item): item is QuizItem => Boolean(item))
  }, [config.pool, roundIds])

  const current = round[index]
  const lastAnswer = answers[index]

  const answer = useCallback(
    (picked: number | null, elapsedMs: number) => {
      if (!current || answeredIndexRef.current === index) return
      answeredIndexRef.current = index
      const correct = picked === current.answer
      const remainingRatio = Math.max(0, (durationMs - elapsedMs) / durationMs)
      const points = correct ? BASE_POINTS + Math.round(MAX_SPEED_BONUS * remainingRatio) : 0
      setAnswers((prev) => [...prev, { picked, correct, points, elapsedMs }])
      setPhase('reveal')
    },
    [current, durationMs, index],
  )

  const onExpire = useCallback(() => answer(null, durationMs), [answer, durationMs])
  const { remaining, getElapsedMs } = useCountdown(durationMs, phase === 'question', index, onExpire)

  const start = () => {
    roundIdRef.current += 1
    answeredIndexRef.current = -1
    const pickedItems = pickRandom(config.pool, config.questionsPerRound)
    setRoundIds(pickedItems.map((q) => q.id))
    setIndex(0)
    setAnswers([])
    setEntry(null)
    setRank(null)
    setPhase('question')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finish = useCallback(
    async (all: Answer[]) => {
      const currentRoundId = roundIdRef.current
      setPhase('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      const score = all.reduce((s, a) => s + a.points, 0)
      unlockGameStamp(config.game === 'trivia' ? 'Speed Trivia' : 'Real vs AI', score)
      if (!player) return
      const saved = await submitScore({
        player_name: player.name,
        institution: player.institution || (en ? 'Public Delegate' : 'Umum'),
        game: config.game,
        score,
        correct_count: all.filter((a) => a.correct).length,
        total_questions: all.length,
        time_seconds: Math.round(all.reduce((s, a) => s + a.elapsedMs, 0) / 100) / 10,
        session_tag: currentSessionTag(),
      })
      if (!mountedRef.current || roundIdRef.current !== currentRoundId) return
      setEntry(saved)
      const list = sortScores(
        (await fetchTodayScores()).filter((e) => e.game === config.game && e.session_tag === saved.session_tag),
      )
      if (!mountedRef.current || roundIdRef.current !== currentRoundId) return
      const pos = list.findIndex((e) => e.id === saved.id)
      const r = pos >= 0 ? pos + 1 : null
      setRank(r)
      const ratio = score / (all.length * (BASE_POINTS + MAX_SPEED_BONUS))
      if ((r !== null && r <= 3) || ratio >= 0.8) {
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#AD2B17', '#C89D54', '#ffffff'],
        })
      }
    },
    [player, config.game, en, unlockGameStamp],
  )

  const next = useCallback(() => {
    if (index + 1 < round.length) {
      setIndex((i) => i + 1)
      setPhase('question')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      void finish(answers)
    }
  }, [index, round.length, answers, finish])

  // Auto-lanjut agar antrean booth tetap bergerak
  useEffect(() => {
    if (phase !== 'reveal') return
    const t = window.setTimeout(next, AUTO_ADVANCE_MS)
    return () => window.clearTimeout(t)
  }, [phase, next])

  // Dukungan keyboard (kiosk): angka 1–4 / A–D untuk menjawab, Enter untuk lanjut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (passportOpen || qrModalOpen) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (phase === 'question' && current) {
        const n = Number(e.key) - 1
        const l = LETTERS.indexOf(e.key.toUpperCase())
        const i = Number.isInteger(n) && n >= 0 ? n : l
        if (i >= 0 && i < current.options.length) answer(i, getElapsedMs())
      } else if (phase === 'reveal' && e.key === 'Enter') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, current, answer, getElapsedMs, next, passportOpen, qrModalOpen])

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-2xl animate-rise">
        <div className="glass p-5 sm:p-10">
          <p className="chip mb-3.5 !border-[#AD2B17]/30 !bg-[#AD2B17]/10 !text-[#AD2B17] dark:!text-white">
            {config.badge}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tighter text-zinc-900 dark:text-white sm:text-4xl">
            {config.title}
          </h1>
          <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:mt-3 sm:text-base">
            {config.description}
          </p>
          <ul className="mt-5 space-y-2.5 border-t border-zinc-200 pt-4 dark:border-white/10 sm:mt-6 sm:pt-5">
            {config.rules.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 sm:text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#AD2B17]" strokeWidth={1.75} />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <button onClick={start} className="btn-primary mt-6 min-h-12 w-full !py-3.5 text-sm sm:mt-8 sm:text-base">
            {en ? 'Start Challenge Now' : 'Mulai Permainan Sekarang'} <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    )
  }

  // ── RESULT ──
  if (phase === 'result') {
    const score = answers.reduce((s, a) => s + a.points, 0)
    const max = answers.length * (BASE_POINTS + MAX_SPEED_BONUS)
    const correct = answers.filter((a) => a.correct).length
    return (
      <div className="mx-auto grid max-w-4xl animate-rise gap-5 sm:gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="glass p-5 text-center sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#AD2B17]/30 bg-[#AD2B17]/10">
            <Trophy className="h-7 w-7 text-[#AD2B17]" strokeWidth={1.75} />
          </div>
          <p className="mt-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            {en ? 'FINAL EVALUATION SCORE' : 'SKOR EVALUASI AKHIR'}
          </p>
          <p className="mt-1 animate-pop font-mono text-5xl font-extrabold tabular-nums text-zinc-900 dark:text-white sm:text-7xl">
            {score}
          </p>
          <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {en ? `OUT OF MAXIMUM ${max} PTS` : `DARI MAKSIMAL ${max} PTS`}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2.5 text-center sm:mt-6 sm:gap-3">
            <Stat label={en ? 'ACCURACY' : 'BENAR'} value={`${correct}/${answers.length}`} />
            <Stat
              label={en ? 'TIME' : 'WAKTU'}
              value={`${(answers.reduce((s, a) => s + a.elapsedMs, 0) / 1000).toFixed(1)}s`}
            />
            <Stat label={en ? 'STANDING' : 'PERINGKAT'} value={rank ? `#${rank}` : entry ? '...' : '—'} />
          </div>

          {entry && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-700 dark:border-white/10 dark:bg-black/40 dark:text-zinc-300 sm:mt-5">
              {en ? 'Score recorded on the ' : 'Skor tercatat pada Leaderboard '}
              <b className="font-mono text-[#AD2B17] dark:text-[#C89D54]">
                {formatSessionTag(entry.session_tag, lang)}
              </b>
              {en ? ' Leaderboard.' : '.'}{' '}
              {rank !== null && rank <= 3 && (
                <span className="mt-1.5 flex items-center justify-center gap-1.5 font-bold text-[#AD2B17] dark:text-[#C89D54]">
                  <Award className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {en
                    ? 'You made the Top 3 Podium — claim your Official NAII Totebag at the break announcement!'
                    : 'Anda masuk Podium Top 3 — klaim Totebag Resmi NAII saat pengumuman sesi break!'}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setPassportOpen(true)}
            className="mt-6 flex min-h-12 w-full items-center justify-between rounded-xl border border-[#C89D54]/60 bg-gradient-to-r from-[#3A0900] via-[#AD2B17] to-[#3A0900] px-4 py-3 text-left text-xs font-bold text-white shadow-md transition hover:-translate-y-[1px] sm:mt-7 sm:text-sm"
          >
            <span className="flex items-center gap-2">
              {stampCount === 2 ? (
                <Ticket className="h-4 w-4 shrink-0 text-[#C89D54]" strokeWidth={2} />
              ) : (
                <Stamp className="h-4 w-4 shrink-0 text-[#C89D54]" strokeWidth={2} />
              )}
              <span>
                {stampCount === 2
                  ? en
                    ? '2/2 Complete! Open Pin Claim Ticket'
                    : '2/2 Lengkap! Buka Tiket Klaim Pin Resmi NAII'
                  : en
                    ? `Stamp #01 Unlocked (FPCI Stamp + Sticker)! Verify naii.co Account (${stampCount}/2)`
                    : `Stempel #01 Terbuka (Stamp FPCI + Stiker)! Verifikasi Akun naii.co (${stampCount}/2)`}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#C89D54]" strokeWidth={2} />
          </button>

          <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:mt-3 sm:flex sm:flex-row sm:gap-3">
            <button onClick={start} className="btn-secondary min-h-12 flex-1">
              <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> {en ? 'Play Again' : 'Main Lagi'}
            </button>
            <a href={ROUTE_PATHS.leaderboard} className="btn-primary min-h-12 flex-1">
              <Trophy className="h-4 w-4" strokeWidth={1.75} /> {en ? 'View Standings' : 'Cek Peringkat'}
            </a>
          </div>
          <a href={ROUTE_PATHS.home} className="btn-secondary mt-2.5 min-h-11 w-full sm:mt-3">
            {en ? 'Back to Main Pavilion' : 'Kembali ke Paviliun Utama'}
          </a>
        </div>
        <div className="space-y-4">
          <CourseCta courses={coursesForQuiz(score / max, lang)} />
        </div>
      </div>
    )
  }

  // ── QUESTION / REVEAL ──
  if (!current) return null
  const revealed = phase === 'reveal'
  const totalScore = answers.reduce((s, a) => s + a.points, 0)

  return (
    <div className="mx-auto max-w-3xl animate-rise" key={current.id}>
      {/* TOP PROGRESS HEADER */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="chip">
            {en ? 'QUESTION' : 'SOAL'} 0{index + 1}/0{round.length}
          </span>
          {/* Visual 5-dot question tracker */}
          <div className="flex items-center gap-1" aria-hidden>
            {round.map((q, i) => {
              const ans = answers[i]
              const cls = ans
                ? ans.correct
                  ? 'bg-emerald-500 w-3.5'
                  : 'bg-rose-500 w-3.5'
                : i === index
                  ? 'bg-[#AD2B17] w-5'
                  : 'bg-zinc-300 dark:bg-white/15 w-2'
              return <span key={q.id} className={`h-2 rounded-full transition-all ${cls}`} />
            })}
          </div>
        </div>
        <span className="chip tabular-nums font-bold !text-zinc-900 dark:!text-white">
          {en ? 'SCORE' : 'SKOR'}: {totalScore} PTS
        </span>
      </div>

      <div className="glass p-5 sm:p-8">
        {current.category && (
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54] sm:text-[11px]">
            {en ? 'CATEGORY' : 'KATEGORI'} // {current.category}
          </p>
        )}

        <div className="mb-4 sm:mb-5">
          {revealed ? (
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <Clock className="h-4 w-4 text-[#AD2B17]" strokeWidth={1.75} />
              {en
                ? `ANSWERED IN ${(lastAnswer.elapsedMs / 1000).toFixed(1)} SECONDS`
                : `DIJAWAB DALAM ${(lastAnswer.elapsedMs / 1000).toFixed(1)} DETIK`}
            </div>
          ) : (
            <TimerBar remaining={remaining} total={durationMs} />
          )}
        </div>

        <h2
          className={`font-bold leading-snug tracking-tight text-zinc-900 dark:text-white ${
            config.layout === 'binary' ? 'text-lg sm:text-2xl' : 'text-base sm:text-2xl'
          }`}
        >
          {config.layout === 'binary' ? `“${current.prompt}”` : current.prompt}
        </h2>

        <div
          className={`mt-5 grid gap-2.5 sm:mt-6 sm:gap-3 ${
            config.layout === 'binary' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {current.options.map((opt, i) => {
            const isAnswer = i === current.answer
            const isPicked = lastAnswer?.picked === i
            let style =
              'border-zinc-200/90 dark:border-white/10 bg-zinc-50/80 dark:bg-white/[0.03] hover:border-[#AD2B17] dark:hover:border-[#AD2B17] hover:bg-white dark:hover:bg-white/[0.07] text-zinc-900 dark:text-zinc-100'
            if (config.layout === 'binary' && !revealed) {
              style =
                i === 0
                  ? 'border-emerald-600/35 dark:border-emerald-400/35 bg-emerald-500/[0.08] hover:bg-emerald-500/15 text-emerald-950 dark:text-emerald-200'
                  : 'border-rose-600/35 dark:border-rose-400/35 bg-rose-500/[0.08] hover:bg-rose-500/15 text-rose-950 dark:text-rose-200'
            }
            if (revealed) {
              style = isAnswer
                ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-500/15 text-emerald-950 dark:text-emerald-200'
                : isPicked
                  ? 'border-rose-500 bg-rose-500/15 text-rose-950 dark:text-rose-200'
                  : 'border-zinc-200 dark:border-white/5 bg-zinc-100/50 dark:bg-white/[0.02] opacity-45 text-zinc-500 dark:text-zinc-400'
            }
            return (
              <button
                key={opt}
                type="button"
                disabled={revealed}
                onClick={() => answer(i, getElapsedMs())}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition active:scale-[0.98] disabled:cursor-default sm:p-4 ${style} ${
                  config.layout === 'binary'
                    ? 'min-h-20 flex-col justify-center text-center text-sm font-extrabold tracking-tight sm:min-h-24 sm:flex-row sm:text-xl'
                    : 'min-h-14 sm:min-h-16'
                }`}
              >
                {config.layout === 'grid' && (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-200/80 font-mono text-xs font-bold text-zinc-800 dark:bg-white/10 dark:text-white">
                    {LETTERS[i]}
                  </span>
                )}
                <span
                  className={
                    config.layout === 'grid'
                      ? 'text-xs font-medium leading-snug sm:text-base'
                      : 'inline-flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2'
                  }
                >
                  {config.layout === 'binary' &&
                    (i === 0 ? (
                      <FileCheck2 className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                    ) : (
                      <ShieldAlert className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                    ))}
                  <span>{opt}</span>
                </span>
                {revealed && isAnswer && (
                  <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                )}
                {revealed && isPicked && !isAnswer && (
                  <XCircle className="ml-auto h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={1.75} />
                )}
              </button>
            )
          })}
        </div>

        {revealed && (
          <div className="mt-5 animate-rise space-y-3.5 sm:mt-6 sm:space-y-4">
            <div
              className={`flex items-center justify-between rounded-xl px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider ${
                lastAnswer.correct
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/15 text-rose-800 dark:text-rose-300'
              }`}
            >
              <span>
                {lastAnswer.correct
                  ? en
                    ? 'CORRECT ANSWER'
                    : 'JAWABAN TEPAT'
                  : lastAnswer.picked === null
                    ? en
                      ? 'TIME EXPIRED'
                      : 'WAKTU HABIS'
                    : en
                      ? 'INCORRECT ANSWER'
                      : 'JAWABAN KURANG TEPAT'}
              </span>
              <span className="animate-pop tabular-nums">+{lastAnswer.points} PTS</span>
            </div>

            <div className="flex gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-800 dark:border-white/10 dark:bg-black/40 dark:text-zinc-200 sm:gap-3 sm:p-4 sm:text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#AD2B17] sm:h-5 sm:w-5" strokeWidth={1.75} />
              <p className="leading-relaxed">
                <b className="font-mono text-[11px] uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
                  {en ? 'DIPLOMATIC FACT: ' : 'FAKTA DIPLOMATIK: '}
                </b>
                {current.info}
              </p>
            </div>

            <button onClick={next} className="btn-primary min-h-12 w-full">
              {index + 1 < round.length
                ? en
                  ? 'Next Question'
                  : 'Lanjut ke Soal Berikutnya'
                : en
                  ? 'View Final Results'
                  : 'Lihat Hasil Akhir'}{' '}
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-white/10 dark:bg-white/[0.03] sm:p-3">
      <p className="font-mono text-lg font-extrabold tabular-nums text-zinc-900 dark:text-white sm:text-xl">{value}</p>
      <p className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:text-[10px]">
        {label}
      </p>
    </div>
  )
}
