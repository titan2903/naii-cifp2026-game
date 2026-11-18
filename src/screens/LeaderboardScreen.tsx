import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Crown,
  Layers,
  Maximize2,
  Medal,
  QrCode,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Tv,
  Zap,
} from 'lucide-react'
import { NaiiStarMark, NaiiWatermark } from '../components/NaiiBrand'
import { BoothQrShowcase } from '../components/QrCodeModal'
import { useLanguage } from '../context/LanguageContext'
import { usePlayer } from '../context/PlayerContext'
import { ROUTE_PATHS } from '../hooks/useHashRoute'
import { backendMode, fetchTodayScores, sortScores, subscribeScores } from '../lib/storage'
import { currentSessionTag, formatSeconds, formatSessionTag, formatSessionWindow, SESSION_TAGS, type SessionTag } from '../lib/utils'
import type { GameId, ScoreEntry } from '../types'

type GameFilter = 'all' | 'trivia' | 'realvsai'
type SessionFilter = 'all' | (typeof SESSION_TAGS)[number]

const DEMO_PLAYERS: Array<{ name: string; inst: string; game: GameId; score: number; correct: number; time: number }> = [
  { name: 'Mahendra Kusuma', inst: 'HI Universitas Indonesia', game: 'trivia', score: 718, correct: 5, time: 13.8 },
  { name: 'Kezia Pramudita', inst: 'FISIPOL Universitas Gadjah Mada', game: 'trivia', score: 694, correct: 5, time: 17.9 },
  { name: 'Rendra Baskoro', inst: 'Diplomat Muda Kemlu RI', game: 'realvsai', score: 685, correct: 5, time: 14.9 },
  { name: 'Tania Larasati', inst: 'STEI Institut Teknologi Bandung', game: 'realvsai', score: 679, correct: 5, time: 15.6 },
  { name: 'Bagaskara Putra', inst: 'HI Universitas Padjadjaran', game: 'trivia', score: 642, correct: 5, time: 22.4 },
  { name: 'Shafira Nadhifa', inst: 'FISIP Universitas Airlangga', game: 'realvsai', score: 625, correct: 5, time: 20.9 },
]

export function LeaderboardScreen() {
  const { lang } = useLanguage()
  const { setQrModalOpen } = usePlayer()
  const en = lang === 'en'

  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [gameFilter, setGameFilter] = useState<GameFilter>('all')
  const [activeSessionTag, setActiveSessionTag] = useState<SessionTag>(() => currentSessionTag())
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>(() => currentSessionTag())
  const [flashId, setFlashId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const flashTimerRef = useRef<number | null>(null)
  const activeSessionRef = useRef<SessionTag>(activeSessionTag)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = currentSessionTag()
      const prev = activeSessionRef.current
      if (next !== prev) {
        activeSessionRef.current = next
        setActiveSessionTag(next)
        setSessionFilter((curr) => (curr === prev ? next : curr))
      }
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchTodayScores()
      setScores(data)
    } finally {
      setLoading(false)
    }
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
        // Hapus data pratinjau demo (id "demo-*") begitu skor delegasi asli masuk
        const realOnly = prev.filter((e) => !e.id.startsWith('demo-'))
        const map = new Map(realOnly.map((e) => [e.id, e]))
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

  /**
   * Pratinjau layar TV saja (in-memory, TIDAK pernah memanggil submitScore / tidak masuk ke Supabase maupun localStorage)
   * sehingga skor simulasi tidak pernah mencemari kompetisi hadiah Totebag Top 3 delegasi asli.
   */
  const seedDemoScores = () => {
    const tag = sessionFilter === 'all' ? currentSessionTag() : sessionFilter
    const now = new Date().toISOString()
    const preview: ScoreEntry[] = DEMO_PLAYERS.map((p, idx) => ({
      id: `demo-${tag}-${idx}`,
      player_name: `${p.name} (Simulasi)`,
      institution: p.inst,
      game: p.game,
      score: p.score,
      correct_count: p.correct,
      total_questions: 5,
      time_seconds: p.time,
      session_tag: tag,
      created_at: now,
    }))
    setScores((prev) => {
      const realOnly = prev.filter((e) => !e.id.startsWith('demo-'))
      return [...realOnly, ...preview]
    })
  }

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen?.()?.catch(() => {})
      } else {
        void document.exitFullscreen?.()?.catch(() => {})
      }
    } catch {
      /* abaikan bila fullscreen tidak didukung browser */
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      {/* 1. HEADER BACKDROP BANNER — NAII Brand Guidelines p.2, p.6, p.9, p.13, p.16:
          Dark Red (#3A0900) backdrop, all-white watermark, vertical left rule, Bold Italic white-on-red subtitle bar */}
      <section className="relative overflow-hidden rounded-xl border border-[#AD2B17]/40 bg-[#3A0900] p-6 text-white sm:p-8">
        <NaiiWatermark className="absolute -bottom-24 -right-24 h-64 w-64 opacity-70 sm:h-80 sm:w-80" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="border-l-2 border-white/85 pl-4 sm:pl-5">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-white/80">
              <Tv className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
              <span>01 // PLENARY STANDINGS · CIFP 2026</span>
            </div>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight leading-[1.08] text-white sm:text-4xl">
              {en ? 'Today’s Top Delegate Standings' : 'Papan Peringkat Delegasi Terbaik Hari Ini'}
            </h1>

            {/* Brand Guidelines p.13: Cover subtitle = Bold Italic, white on #AD2B17 red bar + White outline telemetry pills */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#AD2B17] px-3 py-1 text-xs font-bold italic text-white">
                {en
                  ? 'Top 3 per Break Session → Official NAII Totebag (Tier 3)'
                  : 'Top 3 per Sesi Break → Totebag Resmi NAII (Tier 3)'}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-black/25 px-3 py-1 font-mono text-[11px] font-medium text-white">
                <Activity className="h-3 w-3 text-white" strokeWidth={1.75} />
                {en ? 'SESSION' : 'SESI'}:{' '}
                <strong className="font-bold text-white">
                  {formatSessionTag(activeSessionTag, lang)} · {formatSessionWindow(activeSessionTag)}
                </strong>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/25 px-3 py-1 font-mono text-[11px] font-medium text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-[#AD2B17]" />
                MODE: <strong className="font-bold text-white">{backendMode === 'supabase' ? 'SUPABASE REALTIME' : 'LOCAL STORAGE'}</strong>
              </span>
            </div>

            <p className="mt-3 max-w-[65ch] text-xs leading-relaxed text-white/80 sm:text-sm">
              {en
                ? 'Official break schedule: Morning (11:25–12:00) · Midday (13:15–14:00) · Afternoon (15:15–16:00 WIB).'
                : 'Jadwal sesi break resmi: Pagi (11:25–12:00) · Siang (13:15–14:00) · Sore (15:15–16:00 WIB).'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="btn-primary !px-3.5 !py-2.5 text-xs"
            >
              <QrCode className="h-4 w-4 text-white" strokeWidth={2} />
              {en ? 'Show QR Codes' : 'Tampilkan QR Code'}
            </button>
            <button
              type="button"
              onClick={() => void reload()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:border-white hover:bg-white/20 active:scale-[0.98]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              {en ? 'Refresh Data' : 'Segarkan Data'}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:border-white hover:bg-white/20 active:scale-[0.98] sm:inline-flex"
            >
              <Maximize2 className="h-4 w-4 text-white" strokeWidth={1.75} />
              {en ? 'Booth TV Fullscreen' : 'Mode Layar TV Booth'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. FILTER CONTROLS — NAII Brand Guidelines p.10 & p.11:
          White ground (#FFFFFF), Black text (#000000), NAII Red (#AD2B17) active state & outline pills */}
      <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-black/15 bg-white p-1 dark:border-white/15 dark:bg-[#121212] sm:flex sm:flex-wrap sm:gap-1.5 sm:p-1.5">
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
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold tracking-tight transition sm:px-3.5 ${
                gameFilter === id
                  ? 'bg-[#AD2B17] text-white'
                  : 'text-black hover:bg-black/[0.04] hover:text-[#AD2B17] dark:text-white/80 dark:hover:bg-white/[0.06] dark:hover:text-white'
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
            const windowFull = tag === 'all' ? '' : formatSessionWindow(tag)
            const windowShort = tag === 'all' ? '' : formatSessionWindow(tag, true)
            const labelFull =
              tag === 'all'
                ? en
                  ? 'ALL SESSIONS'
                  : 'SEMUA SESI'
                : `${formatSessionTag(tag, lang).toUpperCase()} (${windowFull.replace(' WIB', '')})`
            const labelShort =
              tag === 'all'
                ? en
                  ? 'ALL'
                  : 'SEMUA'
                : formatSessionTag(tag, lang)
                    .replace(/Break\s*/i, '')
                    .trim()
                    .toUpperCase()
            const active = sessionFilter === tag
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSessionFilter(tag)}
                className={`rounded-lg px-1.5 py-2 text-center font-mono text-[11px] font-bold transition sm:px-3.5 sm:text-xs ${
                  active
                    ? 'border border-[#AD2B17] bg-[#AD2B17] text-white'
                    : 'border border-black/15 bg-white text-black hover:border-[#AD2B17] hover:text-[#AD2B17] dark:border-white/15 dark:bg-[#121212] dark:text-white/85 dark:hover:border-white dark:hover:text-white'
                }`}
              >
                <span className="flex flex-col items-center leading-tight sm:hidden">
                  <span>{labelShort}</span>
                  {windowShort && <span className="text-[9px]">{windowShort}</span>}
                </span>
                <span className="hidden sm:inline">{labelFull}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. SKELETAL LOADING STATE */}
      {loading && scores.length === 0 ? (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="glass h-64 animate-pulse p-8 lg:col-span-6" />
          <div className="grid gap-5 lg:col-span-6">
            <div className="glass h-28 animate-pulse p-6" />
            <div className="glass h-28 animate-pulse p-6" />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* 4. EMPTY STATE — NAII Brand Guidelines p.13 & p.16 ("Social post: White ground, red title, red outline pill, one accent block") */
        <div className="glass relative overflow-hidden p-8 sm:p-12">
          <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 bg-[#AD2B17] sm:h-20 sm:w-20" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <NaiiStarMark color="#AD2B17" className="h-9 w-9 shrink-0" />
              <span className="inline-flex items-center rounded-full border border-[#AD2B17] px-3.5 py-1 text-xs font-medium text-[#AD2B17] dark:border-white dark:text-white">
                {formatSessionTag(activeSessionTag, lang)} · {formatSessionWindow(activeSessionTag)}
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-[#AD2B17] dark:text-white sm:text-3xl">
              {en
                ? 'No Scores Recorded Yet for This Session Filter'
                : 'Belum Ada Skor Tercatat pada Filter Sesi Ini'}
            </h2>

            <p className="text-sm leading-relaxed text-black dark:text-zinc-300">
              {en
                ? 'Play Speed Trivia or Real vs AI to post the inaugural score on the leaderboard, or load demo delegate scores to preview the booth TV display.'
                : 'Mainkan Speed Trivia atau Real vs AI untuk mencatatkan skor perdana di papan peringkat, atau muat simulasi delegasi untuk pratinjau layar TV booth.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href={ROUTE_PATHS.trivia} className="btn-primary">
                <Zap className="h-4 w-4" strokeWidth={1.75} /> {en ? 'Play Speed Trivia' : 'Mainkan Speed Trivia'}
              </a>
              <a href={ROUTE_PATHS.realvsai} className="btn-secondary">
                <ShieldAlert className="h-4 w-4 text-[#AD2B17] dark:text-white" strokeWidth={1.75} /> Real vs AI
              </a>
              <button type="button" onClick={seedDemoScores} className="btn-secondary">
                <Sparkles className="h-4 w-4 text-[#AD2B17] dark:text-white" strokeWidth={1.75} />{' '}
                {en ? 'Load Booth TV Demo Scores' : 'Muat Simulasi Skor TV Booth'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 5. ASYMMETRIC PODIUM BENTO — NAII Brand Guidelines p.6, p.8, p.10, p.11, p.13, p.16 */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* RANK #01 CHAMPION FEATURE TILE:
                NAII Dark Red (#3A0900) backdrop + All-White Star Mark (p.6 & p.8) + NAII Red (#AD2B17) accent block */}
            {champion && (
              <div
                className={`relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#AD2B17]/60 bg-[#3A0900] p-6 text-white sm:p-8 lg:col-span-6 ${
                  flashId === champion.id ? 'animate-flash' : ''
                }`}
              >
                <NaiiWatermark className="absolute -bottom-20 -right-20 h-56 w-56 opacity-60" />

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 rounded-md bg-[#AD2B17] px-3.5 py-1 font-mono text-xs font-bold italic tracking-wider text-white">
                    <Crown className="h-4 w-4 text-white" strokeWidth={2} />
                    {en ? 'RANK #01 // SESSION LEADER' : 'PERINGKAT #01 // PEMIMPIN SESI'}
                  </span>
                  <span className="rounded-full border border-white/35 px-3 py-0.5 font-mono text-xs font-medium text-white">
                    {formatSessionTag(champion.session_tag, lang)}
                  </span>
                </div>

                <div className="relative z-10 my-6 flex items-start justify-between gap-4 border-l-2 border-white/85 pl-4">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                      TIER 3 TOTEBAG CANDIDATE
                    </p>
                    <h2 className="mt-1 truncate text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                      {champion.player_name}
                    </h2>
                    <p className="mt-1 truncate text-sm text-white/85">
                      {champion.institution}
                    </p>
                  </div>
                  {/* Brand Guidelines p.8: "Use the all-white version on Dark Red" */}
                  <NaiiStarMark color="#FFFFFF" className="h-11 w-11 shrink-0" />
                </div>

                <div className="relative z-10 grid grid-cols-3 overflow-hidden rounded-xl border border-white/20 bg-black/35 text-center">
                  <div className="bg-[#AD2B17] px-2 py-3.5 text-white">
                    <p className="font-mono text-2xl font-extrabold tabular-nums text-white sm:text-3xl">
                      {champion.score}
                    </p>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/90">
                      {en ? 'TOTAL POINTS' : 'TOTAL POIN'}
                    </p>
                  </div>
                  <div className="border-x border-white/15 px-2 py-3.5">
                    <p className="font-mono text-xl font-bold tabular-nums text-white sm:text-2xl">
                      {champion.correct_count}/{champion.total_questions}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/75">
                      {en ? 'ACCURACY' : 'KETEPATAN'}
                    </p>
                  </div>
                  <div className="px-2 py-3.5">
                    <p className="font-mono text-xl font-bold tabular-nums text-white sm:text-2xl">
                      {formatSeconds(champion.time_seconds, lang)}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/75">
                      {en ? 'DURATION' : 'DURASI'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* RANK #02 & #03 STACKED TILES:
                Brand Guidelines p.3, p.11, p.13, p.16: White ground, vertical #AD2B17 left bar, Red outline pill, Red score on White (White on Dark) */}
            <div className="grid grid-cols-1 gap-5 lg:col-span-6">
              {[0, 1].map((idx) => {
                const entry = runnersUp[idx]
                const rank = idx + 2
                if (!entry) {
                  return (
                    <a
                      key={`open-rank-${rank}`}
                      href={rank === 2 ? ROUTE_PATHS.trivia : ROUTE_PATHS.realvsai}
                      className="glass group relative flex flex-col justify-between overflow-hidden border-l-4 border-l-[#AD2B17]/45 p-6 transition hover:border-[#AD2B17]"
                    >
                      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-3 w-12 bg-[#AD2B17]/30 transition group-hover:bg-[#AD2B17]" />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#AD2B17] bg-white px-3 py-0.5 font-mono text-xs font-bold text-[#AD2B17] dark:border-white/60 dark:bg-transparent dark:text-white">
                          <Medal className="h-3.5 w-3.5 text-[#AD2B17] dark:text-white" strokeWidth={1.75} />
                          {en ? `RANK #0${rank} · OPEN` : `PERINGKAT #0${rank} · TERBUKA`}
                        </span>
                        <span className="font-mono text-xs font-medium text-black/60 dark:text-white/65">
                          {en ? 'TIER 3 TOTEBAG SLOT' : 'SLOT TOTEBAG TIER 3'}
                        </span>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-extrabold tracking-tight text-black group-hover:text-[#AD2B17] dark:text-white sm:text-xl">
                            {en ? `Podium #0${rank} Waiting for Delegate` : `Podium #0${rank} Menunggu Delegasi`}
                          </h3>
                          <p className="truncate text-xs text-black/65 dark:text-white/70">
                            {en
                              ? 'Play a 45-second round to claim this Top 3 Totebag position.'
                              : 'Mainkan 1 ronde ~45 detik untuk mengisi posisi Top 3 Totebag ini.'}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg bg-[#AD2B17] px-3 py-1.5 font-mono text-xs font-bold text-white">
                          {en ? 'PLAY NOW' : 'MAINKAN'}
                        </span>
                      </div>
                    </a>
                  )
                }

                return (
                  <div
                    key={entry.id}
                    className={`glass relative flex flex-col justify-between overflow-hidden border-l-4 border-l-[#AD2B17] p-6 transition ${
                      flashId === entry.id ? 'animate-flash' : ''
                    }`}
                  >
                    <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-3 w-12 bg-[#AD2B17]" />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {/* Brand Guidelines p.13: Subtitle = Regular/Bold, red outline pill */}
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#AD2B17] bg-white px-3 py-0.5 font-mono text-xs font-bold text-[#AD2B17] dark:border-white dark:bg-transparent dark:text-white">
                        <Medal className="h-3.5 w-3.5 text-[#AD2B17] dark:text-white" strokeWidth={1.75} />
                        {en ? `RANK #0${rank}` : `PERINGKAT #0${rank}`}
                      </span>
                      <span className="font-mono text-xs font-medium text-black/65 dark:text-white/70">
                        {entry.game === 'trivia'
                          ? 'SPEED TRIVIA'
                          : entry.game === 'battle'
                            ? 'PROMPT BATTLE'
                            : 'REAL VS AI'}{' '}
                        · {formatSessionTag(entry.session_tag, lang)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-extrabold tracking-tight text-black dark:text-white sm:text-2xl">
                          {entry.player_name}
                        </h3>
                        <p className="truncate text-xs font-medium text-[#AD2B17] dark:text-white/75">
                          {entry.institution}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-baseline gap-4 text-right font-mono">
                        <div className="text-xs text-black/65 dark:text-white/70">
                          <span className="font-bold text-black dark:text-white">
                            {entry.correct_count}/{entry.total_questions}
                          </span>{' '}
                          · {formatSeconds(entry.time_seconds, lang)}
                        </div>
                        <div>
                          <span className="text-2xl font-extrabold tabular-nums text-[#AD2B17] dark:text-white sm:text-3xl">
                            {entry.score}
                          </span>
                          <span className="ml-1 text-[10px] font-bold text-black/70 dark:text-white/70">PTS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 6. STANDINGS TABLE FOR RANK #04+ — NAII Brand Guidelines p.3 ("Contents" vertical red bar) & p.7 clean horizontal hairlines */}
          {rest.length > 0 && (
            <div className="glass overflow-hidden">
              <div className="flex items-center justify-between bg-[#3A0900] px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-1 bg-[#AD2B17]" />
                  {en
                    ? `DELEGATE STANDINGS (#04 – #${String(rest.length + 3).padStart(2, '0')})`
                    : `DAFTAR PERINGKAT DELEGASI (#04 – #${String(rest.length + 3).padStart(2, '0')})`}
                </span>
                <span className="text-white/85">{en ? 'ACCURACY · TIME · SCORE' : 'KETEPATAN · WAKTU · SKOR'}</span>
              </div>

              <div className="divide-y divide-black/10 dark:divide-white/10">
                {rest.map((entry, idx) => {
                  const rank = idx + 4
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between gap-4 px-5 py-3.5 transition ${
                        flashId === entry.id ? 'animate-flash' : 'hover:bg-black/[0.025] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-4 border-l-2 border-[#AD2B17] pl-3">
                        <span className="w-8 shrink-0 font-mono text-sm font-extrabold tabular-nums text-[#AD2B17] dark:text-white">
                          {String(rank).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-black dark:text-white">{entry.player_name}</p>
                          <p className="truncate font-mono text-xs text-black/65 dark:text-white/65">
                            {entry.institution} ·{' '}
                            <span className="font-semibold text-[#AD2B17] dark:text-white">
                              {entry.game === 'trivia'
                                ? 'Speed Trivia'
                                : entry.game === 'battle'
                                  ? 'Prompt Battle'
                                  : 'Real vs AI'}
                            </span>{' '}
                            · {formatSessionTag(entry.session_tag, lang)}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-6 text-right font-mono">
                        <div className="hidden text-xs text-black/65 sm:block dark:text-white/70">
                          <span className="font-bold text-black dark:text-white">
                            {entry.correct_count}/{entry.total_questions}
                          </span>{' '}
                          · {formatSeconds(entry.time_seconds, lang)}
                        </div>
                        <span className="w-16 text-lg font-extrabold tabular-nums text-[#AD2B17] dark:text-white">
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

      {/* DUAL QR CODE SHOWCASE ON BOOTH TV */}
      <BoothQrShowcase onExpand={() => setQrModalOpen(true)} />
    </div>
  )
}
