import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Crown,
  Layers,
  Maximize2,
  Medal,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trophy,
  Tv,
  Zap,
} from 'lucide-react'
import { NaiiStarMark } from '../components/NaiiBrand'
import { useLanguage } from '../context/LanguageContext'
import { ROUTE_PATHS } from '../hooks/useHashRoute'
import { backendMode, fetchTodayScores, sortScores, submitScore, subscribeScores } from '../lib/storage'
import { currentSessionTag, formatSeconds, formatSessionTag, SESSION_TAGS } from '../lib/utils'
import type { GameId, ScoreEntry } from '../types'

type GameFilter = 'all' | GameId
type SessionFilter = 'all' | (typeof SESSION_TAGS)[number]

const DEMO_PLAYERS: Array<{ name: string; inst: string; game: GameId; score: number; correct: number; time: number }> = [
  { name: 'Mahendra Kusuma', inst: 'HI Universitas Indonesia', game: 'trivia', score: 718, correct: 5, time: 13.8 },
  { name: 'Kezia Pramudita', inst: 'FISIPOL Universitas Gadjah Mada', game: 'trivia', score: 694, correct: 5, time: 17.9 },
  { name: 'Rendra Baskoro', inst: 'Diplomat Muda Kemlu RI', game: 'realvsai', score: 679, correct: 5, time: 15.6 },
  { name: 'Tania Larasati', inst: 'STEI Institut Teknologi Bandung', game: 'trivia', score: 642, correct: 5, time: 22.4 },
  { name: 'Bagaskara Putra', inst: 'HI Universitas Padjadjaran', game: 'realvsai', score: 625, correct: 5, time: 20.9 },
  { name: 'Shafira Nadhifa', inst: 'FISIP Universitas Airlangga', game: 'trivia', score: 568, correct: 4, time: 19.3 },
]

export function LeaderboardScreen() {
  const { lang } = useLanguage()
  const en = lang === 'en'

  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [gameFilter, setGameFilter] = useState<GameFilter>('all')
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all')
  const [flashId, setFlashId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const flashTimerRef = useRef<number | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    const data = await fetchTodayScores()
    setScores(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    void fetchTodayScores().then((data) => {
      if (active) {
        setScores(data)
        setLoading(false)
      }
    })
    const unsub = subscribeScores((entry) => {
      setScores((prev) => {
        const map = new Map(prev.map((e) => [e.id, e]))
        map.set(entry.id, entry)
        return [...map.values()]
      })
      setFlashId(entry.id)
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
      flashTimerRef.current = window.setTimeout(() => setFlashId(null), 2200)
    })
    return () => {
      active = false
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
      unsub()
    }
  }, [])

  const filtered = useMemo(() => {
    return sortScores(
      scores.filter(
        (s) =>
          (gameFilter === 'all' || s.game === gameFilter) &&
          (sessionFilter === 'all' || s.session_tag === sessionFilter),
      ),
    )
  }, [scores, gameFilter, sessionFilter])

  const champion = filtered[0]
  const runnersUp = filtered.slice(1, 3)
  const rest = filtered.slice(3, 25)

  const seedDemoScores = async () => {
    setLoading(true)
    const tag = currentSessionTag()
    for (const p of DEMO_PLAYERS) {
      await submitScore({
        player_name: p.name,
        institution: p.inst,
        game: p.game,
        score: p.score,
        correct_count: p.correct,
        total_questions: 5,
        time_seconds: p.time,
        session_tag: tag,
      })
    }
    await reload()
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.()
    } else {
      void document.exitFullscreen?.()
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      {/* HEADER BAR */}
      <div className="glass flex flex-col justify-between gap-4 p-6 sm:p-8 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-3 py-1 font-mono text-xs font-bold tracking-wider text-white">
              <Tv className="h-3.5 w-3.5" strokeWidth={1.75} />
              PLENARY STANDINGS // CIFP 2026
            </span>
            <span className="chip">
              <Activity className="h-3 w-3 text-[#AD2B17]" strokeWidth={1.75} />
              {en ? 'SESSION' : 'SESI'}:{' '}
              <strong className="text-zinc-900 dark:text-white">
                {formatSessionTag(currentSessionTag(), lang)}
              </strong>
            </span>
            <span className="chip">
              MODE:{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">
                {backendMode === 'supabase' ? 'SUPABASE REALTIME' : 'LOCAL STORAGE'}
              </strong>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tighter text-zinc-900 dark:text-white sm:text-4xl">
            {en ? 'Today’s Top Delegate Standings' : 'Papan Peringkat Delegasi Terbaik Hari Ini'}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {en ? (
              <>
                The top three delegates in each break session (Morning, Midday, Afternoon) earn{' '}
                <b>Official Nusantara AI Institute Grand Merchandise</b>.
              </>
            ) : (
              <>
                Tiga delegasi tertinggi pada setiap sesi break (Pagi, Siang, Sore) berhak meraih{' '}
                <b>Grand Merchandise Resmi Nusantara AI Institute</b>.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => void reload()} className="btn-secondary !px-3.5 !py-2 text-xs">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            {en ? 'Refresh Data' : 'Segarkan Data'}
          </button>
          <button onClick={toggleFullscreen} className="btn-secondary hidden !px-3.5 !py-2 text-xs sm:inline-flex">
            <Maximize2 className="h-4 w-4 text-[#AD2B17]" strokeWidth={1.75} />
            {en ? 'Booth TV Fullscreen' : 'Mode Layar TV Booth'}
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS (Single-Row Friendly on Smartphone) */}
      <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-zinc-200 bg-white/80 p-1 dark:border-white/10 dark:bg-white/[0.03] sm:flex sm:flex-wrap sm:gap-1.5 sm:p-1.5">
          {(
            [
              ['all', en ? 'All' : 'Semua', en ? 'All Instruments' : 'Semua Instrumen', Layers],
              ['trivia', 'Trivia', 'Speed Trivia', Zap],
              ['realvsai', 'Real/AI', 'Real vs AI', ShieldAlert],
            ] as const
          ).map(([id, shortLabel, fullLabel, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setGameFilter(id)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold tracking-tight transition sm:px-3.5 ${
                gameFilter === id
                  ? 'bg-[#AD2B17] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{fullLabel}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap">
          {(['all', ...SESSION_TAGS] as const).map((tag) => {
            const labelFull =
              tag === 'all' ? (en ? 'ALL SESSIONS' : 'SEMUA SESI') : formatSessionTag(tag, lang).toUpperCase()
            const labelShort =
              tag === 'all'
                ? en
                  ? 'ALL'
                  : 'SEMUA'
                : formatSessionTag(tag, lang)
                    .replace(/Break\s*/i, '')
                    .toUpperCase()
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSessionFilter(tag)}
                className={`rounded-xl px-2 py-2 text-center font-mono text-[11px] font-semibold transition sm:px-3.5 sm:text-xs ${
                  sessionFilter === tag
                    ? 'border border-[#AD2B17] bg-[#AD2B17]/10 text-[#AD2B17] dark:bg-[#AD2B17]/20 dark:text-white'
                    : 'border border-zinc-200 bg-white/80 text-zinc-600 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <span className="sm:hidden">{labelShort}</span>
                <span className="hidden sm:inline">{labelFull}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* SKELETAL LOADING STATE (Rule 5) */}
      {loading && scores.length === 0 ? (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="glass h-64 animate-pulse p-8 lg:col-span-6" />
          <div className="grid gap-5 lg:col-span-6">
            <div className="glass h-28 animate-pulse p-6" />
            <div className="glass h-28 animate-pulse p-6" />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* COMPOSED EMPTY STATE (Rule 5) */
        <div className="glass p-10 text-center sm:p-14">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#AD2B17]/25 bg-[#AD2B17]/10">
            <Trophy className="h-7 w-7 text-[#AD2B17]" strokeWidth={1.75} />
          </div>
          <h2 className="mt-4 text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
            {en
              ? 'No Scores Recorded Yet for This Session Filter'
              : 'Belum Ada Skor Tercatat pada Filter Sesi Ini'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {en
              ? 'Play Speed Trivia or Real vs AI to post the inaugural score on the leaderboard, or load demo delegate scores to preview the booth TV display.'
              : 'Mainkan Speed Trivia atau Real vs AI untuk mencatatkan skor perdana di papan peringkat, atau muat simulasi delegasi untuk pratinjau layar TV booth.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={ROUTE_PATHS.trivia} className="btn-primary">
              <Zap className="h-4 w-4" strokeWidth={1.75} /> {en ? 'Play Speed Trivia' : 'Mainkan Speed Trivia'}
            </a>
            <button onClick={() => void seedDemoScores()} className="btn-secondary">
              <Sparkles className="h-4 w-4 text-[#AD2B17]" strokeWidth={1.75} />{' '}
              {en ? 'Load Booth TV Demo Scores' : 'Muat Simulasi Skor TV Booth'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ASYMMETRIC PODIUM BENTO (6 COLS CHAMPION + 6 COLS STACKED RUNNERS-UP — NO 3-EQUAL-COL ROW) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* RANK #1 CHAMPION FEATURE TILE */}
            {champion && (
              <div
                className={`glass relative flex flex-col justify-between overflow-hidden border-[#AD2B17]/50 p-6 sm:p-8 lg:col-span-6 ${
                  flashId === champion.id ? 'animate-flash' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#AD2B17] px-3.5 py-1 font-mono text-xs font-bold tracking-wider text-white">
                    <Crown className="h-4 w-4 text-[#C89D54]" strokeWidth={2} />
                    {en ? 'RANK #01 // SESSION LEADER' : 'PERINGKAT #01 // PEMIMPIN SESI'}
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {formatSessionTag(champion.session_tag, lang)}
                  </span>
                </div>

                <div className="my-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#AD2B17] dark:text-[#C89D54]">
                      GRAND MERCHANDISE CANDIDATE
                    </p>
                    <h2 className="mt-1 truncate text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                      {champion.player_name}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-300">
                      {champion.institution}
                    </p>
                  </div>
                  <NaiiStarMark color="#AD2B17" className="h-10 w-10 shrink-0 opacity-85" />
                </div>

                <div className="grid grid-cols-3 divide-x divide-zinc-200 rounded-2xl border border-zinc-200/90 bg-zinc-50/90 py-3.5 text-center dark:divide-white/10 dark:border-white/10 dark:bg-black/40">
                  <div className="px-2">
                    <p className="font-mono text-2xl font-extrabold tabular-nums text-[#AD2B17] dark:text-[#C89D54] sm:text-3xl">
                      {champion.score}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {en ? 'TOTAL POINTS' : 'TOTAL POIN'}
                    </p>
                  </div>
                  <div className="px-2">
                    <p className="font-mono text-xl font-bold tabular-nums text-zinc-900 dark:text-white sm:text-2xl">
                      {champion.correct_count}/{champion.total_questions}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {en ? 'ACCURACY' : 'KETEPATAN'}
                    </p>
                  </div>
                  <div className="px-2">
                    <p className="font-mono text-xl font-bold tabular-nums text-zinc-900 dark:text-white sm:text-2xl">
                      {formatSeconds(champion.time_seconds, lang)}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {en ? 'DURATION' : 'DURASI'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* RANK #2 & #3 STACKED TILES */}
            <div className="grid grid-cols-1 gap-5 lg:col-span-6">
              {runnersUp.map((entry, idx) => {
                const rank = idx + 2
                return (
                  <div
                    key={entry.id}
                    className={`glass flex flex-col justify-between p-6 transition ${
                      flashId === entry.id ? 'animate-flash' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 font-mono text-xs font-bold text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-white">
                        <Medal className="h-3.5 w-3.5 text-[#AD2B17]" strokeWidth={1.75} />
                        {en ? `RANK #0${rank}` : `PERINGKAT #0${rank}`}
                      </span>
                      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {entry.game === 'trivia' ? 'SPEED TRIVIA' : 'REAL VS AI'} ·{' '}
                        {formatSessionTag(entry.session_tag, lang)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                          {entry.player_name}
                        </h3>
                        <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{entry.institution}</p>
                      </div>

                      <div className="flex shrink-0 items-baseline gap-4 text-right font-mono">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {entry.correct_count}/{entry.total_questions}
                          </span>{' '}
                          · {formatSeconds(entry.time_seconds, lang)}
                        </div>
                        <div>
                          <span className="text-2xl font-extrabold tabular-nums text-[#AD2B17] dark:text-[#C89D54]">
                            {entry.score}
                          </span>
                          <span className="ml-1 text-[10px] text-zinc-500">PTS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* COCKPIT TELEMETRY TABLE FOR RANK #4+ (Rule 4: Logic Grouping via divide-y) */}
          {rest.length > 0 && (
            <div className="glass overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-200/90 bg-zinc-50/80 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-white/10 dark:bg-black/40 dark:text-zinc-400">
                <span>
                  {en
                    ? `DELEGATE STANDINGS (#04 – #${String(rest.length + 3).padStart(2, '0')})`
                    : `DAFTAR PERINGKAT DELEGASI (#04 – #${String(rest.length + 3).padStart(2, '0')})`}
                </span>
                <span>{en ? 'ACCURACY · TIME · SCORE' : 'KETEPATAN · WAKTU · SKOR'}</span>
              </div>
              <div className="divide-y divide-zinc-200/70 dark:divide-white/[0.06]">
                {rest.map((entry, idx) => {
                  const rank = idx + 4
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between gap-4 px-5 py-3.5 transition ${
                        flashId === entry.id ? 'animate-flash' : 'hover:bg-zinc-100/60 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-200/80 font-mono text-xs font-bold text-zinc-700 dark:bg-white/10 dark:text-zinc-300">
                          #{String(rank).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-zinc-900 dark:text-white">{entry.player_name}</p>
                          <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
                            {entry.institution} ·{' '}
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {entry.game === 'trivia' ? 'Speed Trivia' : 'Real vs AI'}
                            </span>{' '}
                            · {formatSessionTag(entry.session_tag, lang)}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-6 text-right font-mono">
                        <div className="hidden text-xs text-zinc-500 sm:block dark:text-zinc-400">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {entry.correct_count}/{entry.total_questions}
                          </span>{' '}
                          · {formatSeconds(entry.time_seconds, lang)}
                        </div>
                        <span className="w-16 text-lg font-extrabold tabular-nums text-[#AD2B17] dark:text-[#C89D54]">
                          {entry.score}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
