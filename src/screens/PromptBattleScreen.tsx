import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import {
  ArrowRight,
  Check,
  Clock,
  Crown,
  FileTerminal,
  Flame,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Swords,
  Trophy,
  User,
} from 'lucide-react'
import { CourseCta } from '../components/CourseCta'
import { NaiiStarMark } from '../components/NaiiBrand'
import { RequirePlayer } from '../components/PlayerGate'
import { TimerBar } from '../components/TimerBar'
import { useLanguage } from '../context/LanguageContext'
import { usePlayer } from '../context/PlayerContext'
import { getPromptMissions } from '../data/promptBattle'
import { useCountdown } from '../hooks/useCountdown'
import { ROUTE_PATHS } from '../hooks/useHashRoute'
import { evaluatePrompt } from '../lib/evaluatePrompt'
import { fetchTodayScores, sortScores, submitScore } from '../lib/storage'
import { currentSessionTag, formatSessionTag } from '../lib/utils'
import type { PromptBattleMission, PromptEvaluation, ScoreEntry } from '../types'

const BATTLE_DURATION_MS = 60_000

export function PromptBattleScreen() {
  const { lang } = useLanguage()
  const en = lang === 'en'

  return (
    <RequirePlayer
      title={en ? '60-Second Diplomatic Prompt Battle' : '60-Second Diplomatic Prompt Battle'}
      subtitle={
        en
          ? 'Enter your delegate accreditation to step into the prompt engineering arena and compete on the Live Leaderboard.'
          : 'Masukkan akreditasi delegasi Anda untuk memasuki arena adu prompt dan berkompetisi di Papan Peringkat Live.'
      }
    >
      <PromptBattleFlow />
    </RequirePlayer>
  )
}

function PromptBattleFlow() {
  const { player } = usePlayer()
  const { lang } = useLanguage()
  const en = lang === 'en'

  const missions = useMemo(() => getPromptMissions(lang), [lang])
  const [selectedMissionId, setSelectedMissionId] = useState<string>(missions[0].id)
  const [mode, setMode] = useState<'solo' | 'duel'>('solo')
  const [phase, setPhase] = useState<'setup' | 'battle' | 'result'>('setup')

  // Solo inputs
  const [soloPrompt, setSoloPrompt] = useState('')
  const [soloEval, setSoloEval] = useState<PromptEvaluation | null>(null)
  const [savedEntry, setSavedEntry] = useState<ScoreEntry | null>(null)
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null)

  // Duel inputs
  const [player2Name, setPlayer2Name] = useState('Delegasi Sahabat')
  const [p1Prompt, setP1Prompt] = useState('')
  const [p2Prompt, setP2Prompt] = useState('')
  const [p1Eval, setP1Eval] = useState<PromptEvaluation | null>(null)
  const [p2Eval, setP2Eval] = useState<PromptEvaluation | null>(null)

  const activeMission: PromptBattleMission = useMemo(
    () => missions.find((m) => m.id === selectedMissionId) ?? missions[0],
    [missions, selectedMissionId],
  )

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Live real-time analysis of prompt while typing
  const liveSoloEval = useMemo(
    () => (phase === 'battle' && mode === 'solo' ? evaluatePrompt(soloPrompt, activeMission, lang) : null),
    [phase, mode, soloPrompt, activeMission, lang],
  )

  const finishBattleRef = useRef<() => void>(() => {})

  const onTimeExpire = useCallback(() => {
    if (phase !== 'battle') return
    finishBattleRef.current()
  }, [phase])

  const { remaining, getElapsedMs } = useCountdown(
    BATTLE_DURATION_MS,
    phase === 'battle',
    `${selectedMissionId}-${phase}`,
    onTimeExpire,
  )

  const startBattle = () => {
    setSoloPrompt('')
    setP1Prompt('')
    setP2Prompt('')
    setSoloEval(null)
    setP1Eval(null)
    setP2Eval(null)
    setSavedEntry(null)
    setLeaderboardRank(null)
    setPhase('battle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finishBattle = useCallback(async () => {
    setPhase('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (mode === 'solo') {
      const evaluation = evaluatePrompt(soloPrompt, activeMission, lang)
      setSoloEval(evaluation)

      if (player) {
        const timeSec = Math.round(getElapsedMs() / 100) / 10
        const saved = await submitScore({
          player_name: player.name,
          institution: player.institution || (en ? 'Delegate' : 'Umum'),
          game: 'battle',
          score: evaluation.score,
          correct_count: Object.values(evaluation.pillars).filter((p) => p.score >= 21).length,
          total_questions: 4,
          time_seconds: timeSec,
          session_tag: currentSessionTag(),
        })

        if (!mountedRef.current) return
        setSavedEntry(saved)

        const list = sortScores(
          (await fetchTodayScores()).filter((e) => e.game === 'battle' && e.session_tag === saved.session_tag),
        )
        const pos = list.findIndex((e) => e.id === saved.id)
        setLeaderboardRank(pos >= 0 ? pos + 1 : null)

        if (evaluation.score >= 85) {
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#AD2B17', '#C89D54', '#ffffff'],
          })
        }
      }
    } else {
      const evaluation1 = evaluatePrompt(p1Prompt, activeMission, lang)
      const evaluation2 = evaluatePrompt(p2Prompt, activeMission, lang)
      setP1Eval(evaluation1)
      setP2Eval(evaluation2)

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#AD2B17', '#C89D54', '#ffffff'],
      })
    }
  }, [mode, soloPrompt, p1Prompt, p2Prompt, activeMission, lang, player, en, getElapsedMs])

  useEffect(() => {
    finishBattleRef.current = () => {
      void finishBattle()
    }
  }, [finishBattle])

  const insertTemplate = (target: 'solo' | 'p1' | 'p2') => {
    const t = activeMission.starterTemplate
    if (target === 'solo') setSoloPrompt(t)
    else if (target === 'p1') setP1Prompt(t)
    else setP2Prompt(t)
  }

  // ── PHASE 1: SETUP & MISSION BRIEFING ──
  if (phase === 'setup') {
    return (
      <div className="space-y-6 animate-rise">
        {/* BANNER HEADER */}
        <div className="glass p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white sm:px-3 sm:text-xs">
                  <Flame className="h-3.5 w-3.5 text-[#C89D54]" strokeWidth={2} />
                  {en ? 'GAME 03 // COFFEE BREAK ACTIVATION' : 'PERMAINAN 03 // AKTIVASI KHUSUS COFFEE BREAK'}
                </span>
                <span className="chip">
                  <Clock className="h-3.5 w-3.5 text-[#AD2B17]" strokeWidth={1.75} />
                  {en ? '60 SECONDS TIMED BATTLE' : 'TANTANGAN 60 DETIK'}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tighter text-zinc-900 dark:text-white sm:text-4xl">
                60-Second Diplomatic Prompt Battle
              </h1>
              <p className="max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
                {en ? (
                  <>
                    Test your AI steering mastery. Craft the most effective prompt based on the{' '}
                    <b>4 NAII Prompting Pillars: Role, Context, Constraint, and Objective</b> within 60 seconds!
                  </>
                ) : (
                  <>
                    Uji ketangkasan menyusun instruksi AI diplomatik. Tulis prompt kebijakan luar negeri terbaik dengan{' '}
                    <b>4 Pilar Metode NAII: Peran (Role), Konteks (Context), Batasan (Constraint), dan Tujuan (Objective)</b>{' '}
                    dalam waktu 60 detik!
                  </>
                )}
              </p>
            </div>

            {/* MODE SWITCHER: SOLO OR 1V1 DUEL */}
            <div className="flex items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-100/80 p-1 dark:border-white/10 dark:bg-black/40 sm:p-1.5">
              <button
                type="button"
                onClick={() => setMode('solo')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition sm:px-4 ${
                  mode === 'solo'
                    ? 'bg-[#AD2B17] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <User className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{en ? 'Solo Challenge' : 'Tantangan Mandiri'}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('duel')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition sm:px-4 ${
                  mode === 'duel'
                    ? 'bg-[#AD2B17] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Swords className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{en ? '1 vs 1 Stage Duel' : 'Duel 1 vs 1 Panggung'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 PILLARS EXPLAINER CARDS */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-zinc-200/90 bg-white/80 p-3.5 dark:border-white/10 dark:bg-white/[0.03] sm:p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
              01 // {en ? 'ROLE' : 'PERAN'} (25 PTS)
            </p>
            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-white">
              {en ? 'Persona & Stance' : 'Persona Diplomat RI'}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400">
              {en ? 'e.g. "Act as Senior Foreign Policy Analyst"' : 'Contoh: "Bertindaklah sebagai Analis Kemlu RI"'}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200/90 bg-white/80 p-3.5 dark:border-white/10 dark:bg-white/[0.03] sm:p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
              02 // {en ? 'CONTEXT' : 'KONTEKS'} (25 PTS)
            </p>
            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-white">
              {en ? 'Geopolitical Dossier' : 'Latar Krisis Global'}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400">
              {en ? 'e.g. Subsea cable tension in Indo-Pacific' : 'Contoh: Sengketa kabel laut & satelit orbit'}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200/90 bg-white/80 p-3.5 dark:border-white/10 dark:bg-white/[0.03] sm:p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
              03 // {en ? 'CONSTRAINT' : 'BATASAN'} (25 PTS)
            </p>
            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-white">
              {en ? 'Format & Ethics' : 'Format & Nada Etis'}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400">
              {en ? 'e.g. 1 concise paragraph, non-aligned tone' : 'Contoh: 1 paragraf, netral, tegas diplomatis'}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200/90 bg-white/80 p-3.5 dark:border-white/10 dark:bg-white/[0.03] sm:p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
              04 // {en ? 'OBJECTIVE' : 'TUJUAN'} (25 PTS)
            </p>
            <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-white">
              {en ? 'Actionable Deliverable' : 'Tujuan Akhir Kebijakan'}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400">
              {en ? 'e.g. Presidential mediation address' : 'Contoh: Pidato penengah de-eskalasi 24 jam'}
            </p>
          </div>
        </div>

        {/* MISSION CARDS PICKER */}
        <div className="space-y-3">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {en ? 'SELECT CRISIS MISSION TO TACKLE:' : 'PILIH MISI KRISIS UNTUK DITANGANI:'}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {missions.map((m) => {
              const active = m.id === selectedMissionId
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMissionId(m.id)}
                  className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                    active
                      ? 'border-[#AD2B17] bg-[#AD2B17]/[0.06] shadow-xs dark:border-[#AD2B17] dark:bg-[#AD2B17]/15'
                      : 'border-zinc-200 bg-white/70 hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03]'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="chip !text-[10px]">{m.code}</span>
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white sm:text-base">{m.title}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{m.topic}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-200/80 pt-2 text-xs font-bold dark:border-white/10">
                    <span className="text-[#AD2B17] dark:text-[#C89D54]">
                      {active ? (en ? 'Selected Mission' : 'Misi Terpilih') : en ? 'Select' : 'Pilih'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#AD2B17]" strokeWidth={1.75} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* SELECTED MISSION DETAILS & START BUTTON */}
        <div className="glass space-y-5 p-5 sm:p-8">
          <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-black/35 sm:p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
              {en ? 'DOSSIER BRIEFING:' : 'BERKAS SITUASI KRISIS:'}
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-zinc-900 dark:text-white sm:text-xl">
              {activeMission.title}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-sm">
              {activeMission.scenario}
            </p>
            <div className="mt-3 rounded-xl border border-[#AD2B17]/20 bg-[#AD2B17]/5 p-3 text-xs text-zinc-800 dark:text-zinc-200">
              <strong className="text-[#AD2B17] dark:text-[#C89D54]">
                {en ? 'Your 60-Second Directive:' : 'Instruksi Tugas 60 Detik Anda:'}
              </strong>{' '}
              {activeMission.task}
            </div>
          </div>

          {mode === 'duel' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="font-mono text-xs font-bold uppercase text-[#AD2B17]">DELEGASI #01 (ANDA)</p>
                <p className="mt-1 text-sm font-extrabold text-zinc-900 dark:text-white">
                  {player?.name} {player?.institution ? `(${player.institution})` : ''}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <label
                  htmlFor="challenger-name"
                  className="font-mono text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400"
                >
                  {en ? 'DELEGATE #02 (CHALLENGER NAME)' : 'DELEGASI #02 (NAMA PENANTANG PANGGUNG)'}
                </label>
                <input
                  id="challenger-name"
                  className="field mt-1"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder={en ? 'e.g. Nadia Salsabila' : 'Contoh: Nadia Salsabila'}
                />
              </div>
            </div>
          )}

          <button onClick={startBattle} className="btn-primary min-h-12 w-full !py-3.5 text-sm sm:text-base">
            <Flame className="h-5 w-5 text-[#C89D54]" strokeWidth={2} />
            <span>
              {mode === 'solo'
                ? en
                  ? 'Start 60-Second Challenge Now'
                  : 'Mulai Tantangan 60 Detik Sekarang'
                : en
                  ? 'Launch 1 vs 1 Stage Duel'
                  : 'Mulai Duel Panggung 1 vs 1'}
            </span>
            <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    )
  }

  // ── PHASE 2: ACTIVE 60-SECOND BATTLE ──
  if (phase === 'battle') {
    return (
      <div className="space-y-4 animate-rise sm:space-y-6">
        {/* TIMER & MISSION STATUS BAR */}
        <div className="glass space-y-3 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="chip !border-[#AD2B17]/30 !bg-[#AD2B17]/10 !text-[#AD2B17] dark:!text-white">
                <Clock className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
                {en ? 'BATTLE IN PROGRESS // 60s' : 'PERTANDINGAN BERLANGSUNG // 60s'}
              </span>
              <span className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {activeMission.title}
              </span>
            </div>
            <button
              onClick={() => void finishBattle()}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              {en ? 'Submit Prompt Now' : 'Sahkan Prompt Sekarang'}{' '}
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <TimerBar remaining={remaining} total={BATTLE_DURATION_MS} />
        </div>

        {/* INPUT WORKBENCH */}
        {mode === 'solo' ? (
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            {/* LEFT: TEXTAREA & TEMPLATE BUTTON */}
            <div className="glass space-y-4 p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="solo-prompt-input"
                  className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  {en ? 'Your Foreign Policy Prompt Directive:' : 'Instruksi Prompt Kebijakan Luar Negeri Anda:'}
                </label>
                <button
                  type="button"
                  onClick={() => insertTemplate('solo')}
                  className="inline-flex items-center gap-1 font-mono text-xs text-[#AD2B17] hover:underline dark:text-[#C89D54]"
                >
                  <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {en ? 'Insert Starter Template' : 'Gunakan Template Pembuka'}
                </button>
              </div>

              <textarea
                id="solo-prompt-input"
                rows={7}
                autoFocus
                value={soloPrompt}
                onChange={(e) => setSoloPrompt(e.target.value)}
                placeholder={
                  en
                    ? 'Type your prompt here... Remember to include Role, Context, Constraint, and Objective.'
                    : 'Ketik prompt kebijakan Anda di sini... Pastikan mencakup Peran, Konteks, Batasan, dan Tujuan.'
                }
                className="field resize-none text-sm leading-relaxed"
              />

              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{soloPrompt.trim().split(/\s+/).filter(Boolean).length} {en ? 'words' : 'kata'}</span>
                <span className="font-mono">
                  {en ? 'Target: 4 Pillars for 100 PTS' : 'Target: 4 Pilar untuk 100 PTS'}
                </span>
              </div>
            </div>

            {/* RIGHT: REAL-TIME 4-PILLAR RADAR */}
            <div className="glass space-y-4 p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-white/10">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
                  {en ? 'LIVE 4-PILLAR DETECTION' : 'RADAR DETEKSI 4 PILAR METODE NAII'}
                </p>
                <span className="chip tabular-nums font-bold">
                  {liveSoloEval?.score ?? 0}/100 PTS
                </span>
              </div>

              <div className="space-y-3">
                {liveSoloEval &&
                  (
                    [
                      ['role', liveSoloEval.pillars.role, '#AD2B17', 'bg-[#AD2B17]'],
                      ['context', liveSoloEval.pillars.context, '#C89D54', 'bg-[#C89D54]'],
                      ['constraint', liveSoloEval.pillars.constraint, '#0284C7', 'bg-sky-600'],
                      ['objective', liveSoloEval.pillars.objective, '#059669', 'bg-emerald-600'],
                    ] as const
                  ).map(([key, p, colorHex, bgCls]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 transition-colors dark:border-white/10 dark:bg-black/35"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5" style={{ color: colorHex }}>
                          <span className={`inline-block h-2 w-2 rounded-full ${bgCls}`} />
                          {p.name}
                        </span>
                        <span
                          className={`font-mono text-xs font-extrabold ${
                            p.score >= 21
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : p.score > 0
                                ? 'text-[#C89D54]'
                                : 'text-zinc-400'
                          }`}
                        >
                          {p.score}/{p.maxScore}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200/90 dark:bg-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${bgCls}`}
                          style={{ width: `${(p.score / p.maxScore) * 100}%` }}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                        <span className="text-zinc-500 dark:text-zinc-400">{p.feedback}</span>
                        {p.detected.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {p.detected.map((w) => (
                              <span
                                key={w}
                                className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 font-mono text-[9px] font-bold tracking-tight text-white"
                                style={{ backgroundColor: colorHex }}
                              >
                                <Check className="h-2.5 w-2.5" />
                                {w}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* DUEL WORKBENCH (SIDE-BY-SIDE ON DESKTOP) */
          <div className="grid gap-5 lg:grid-cols-2">
            {/* PLAYER 1: RED CORNER */}
            <div className="glass space-y-3.5 border-[#AD2B17]/40 p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded bg-[#AD2B17] font-mono text-[10px] font-bold text-white">
                    P1
                  </span>
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17]">
                      {en ? 'RED PODIUM // DELEGATE 1' : 'PODIUM MERAH // DELEGASI 1'}
                    </p>
                    <p className="truncate text-xs font-extrabold text-zinc-900 dark:text-white sm:text-sm">
                      {player?.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => insertTemplate('p1')}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#AD2B17]/30 bg-[#AD2B17]/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#AD2B17] hover:bg-[#AD2B17]/20 dark:text-white"
                >
                  <Lightbulb className="h-3 w-3" />
                  Template
                </button>
              </div>

              <textarea
                rows={7}
                value={p1Prompt}
                onChange={(e) => setP1Prompt(e.target.value)}
                placeholder={
                  en
                    ? 'Player 1: Craft your diplomatic prompt here... (Role, Context, Constraint, Objective)'
                    : 'Delegasi 1: Ketik instruksi prompt diplomasi Anda di sini... (Peran, Konteks, Batasan, Tujuan)'
                }
                className="field resize-none text-xs leading-relaxed focus:border-[#AD2B17] sm:text-sm"
              />

              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>{p1Prompt.trim().split(/\s+/).filter(Boolean).length} {en ? 'words' : 'kata'}</span>
                <span>{p1Prompt.length} {en ? 'chars' : 'karakter'}</span>
              </div>
            </div>

            {/* PLAYER 2: GOLD CORNER */}
            <div className="glass space-y-3.5 border-[#C89D54]/50 p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded bg-[#C89D54] font-mono text-[10px] font-bold text-white">
                    P2
                  </span>
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9A6F22] dark:text-[#C89D54]">
                      {en ? 'GOLD PODIUM // DELEGATE 2' : 'PODIUM EMAS // DELEGASI 2'}
                    </p>
                    <p className="truncate text-xs font-extrabold text-zinc-900 dark:text-white sm:text-sm">
                      {player2Name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => insertTemplate('p2')}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#C89D54]/30 bg-[#C89D54]/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#9A6F22] hover:bg-[#C89D54]/20 dark:text-[#C89D54]"
                >
                  <Lightbulb className="h-3 w-3" />
                  Template
                </button>
              </div>

              <textarea
                rows={7}
                value={p2Prompt}
                onChange={(e) => setP2Prompt(e.target.value)}
                placeholder={
                  en
                    ? 'Player 2: Craft your diplomatic prompt here... (Role, Context, Constraint, Objective)'
                    : 'Delegasi 2: Ketik instruksi prompt diplomasi Anda di sini... (Peran, Konteks, Batasan, Tujuan)'
                }
                className="field resize-none text-xs leading-relaxed focus:border-[#C89D54] sm:text-sm"
              />

              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>{p2Prompt.trim().split(/\s+/).filter(Boolean).length} {en ? 'words' : 'kata'}</span>
                <span>{p2Prompt.length} {en ? 'chars' : 'karakter'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── PHASE 3: EVALUATION RESULTS & WINNER PODIUM ──
  const sealCls =
    soloEval?.grade === 'S'
      ? 'seal-grade-s'
      : soloEval?.grade === 'A'
        ? 'seal-grade-a'
        : soloEval?.grade === 'B'
          ? 'seal-grade-b'
          : 'seal-grade-c'

  return (
    <div className="space-y-6 animate-rise">
      {mode === 'solo' && soloEval ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* MAIN SCORE & SIMULATED SPEECH */}
          <div className="glass space-y-5 p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3.5 dark:border-white/10">
              <span className="chip !border-[#AD2B17]/30 !bg-[#AD2B17]/10 !text-[#AD2B17] dark:!text-white">
                <Trophy className="h-3.5 w-3.5" strokeWidth={1.75} />
                {en ? 'EVALUATION SCORE' : 'SKOR AKHIR EVALUASI'}
              </span>
              <span className="chip">
                {en ? 'GRADE' : 'PERINGKAT'}:{' '}
                <strong className="text-[#AD2B17] dark:text-[#C89D54]">{soloEval.grade}</strong>
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className={`relative grid h-24 w-24 shrink-0 place-items-center rounded-2xl border-2 ${sealCls}`}>
                <div className="text-center">
                  <span className="font-mono text-[9px] font-bold tracking-widest uppercase opacity-80">GRADE</span>
                  <p className="font-mono text-4xl font-extrabold leading-none">{soloEval.grade}</p>
                  <span className="font-mono text-[10px] font-bold tabular-nums opacity-90">{soloEval.score} PTS</span>
                </div>
                <div className="absolute -top-2 -right-2">
                  <NaiiStarMark color="#C89D54" className="h-5 w-5" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#AD2B17] dark:text-[#C89D54]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{en ? 'DIPLOMATIC EVALUATION' : 'EVALUASI DIPLOMATIK RESMI'}</span>
                </div>
                <h2 className="mt-0.5 text-xl font-extrabold text-zinc-900 dark:text-white sm:text-2xl">
                  {soloEval.grade === 'S'
                    ? en
                      ? 'Master Diplomatic Prompt Engineer'
                      : 'Analis Ahli Prompt Diplomatik'
                    : soloEval.grade === 'A'
                      ? en
                        ? 'Proficient Policy Prompt Engineer'
                        : 'Praktisi Handal Prompt Kebijakan'
                      : en
                        ? 'Promising Diplomatic Learner'
                        : 'Pemula Berbakat Diplomasi Digital'}
                </h2>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{soloEval.feedback}</p>
              </div>
            </div>

            {/* 4 PILLARS BREAKDOWN */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {(
                [
                  ['role', soloEval.pillars.role, '#AD2B17', 'bg-[#AD2B17]'],
                  ['context', soloEval.pillars.context, '#C89D54', 'bg-[#C89D54]'],
                  ['constraint', soloEval.pillars.constraint, '#0284C7', 'bg-sky-600'],
                  ['objective', soloEval.pillars.objective, '#059669', 'bg-emerald-600'],
                ] as const
              ).map(([k, p, colorHex, bgCls]) => (
                <div
                  key={k}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-white/10 dark:bg-black/35"
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {p.name}
                  </p>
                  <p className="mt-1 font-mono text-lg font-extrabold" style={{ color: colorHex }}>
                    {p.score}/25
                  </p>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                    <div className={`h-full rounded-full ${bgCls}`} style={{ width: `${(p.score / 25) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 truncate font-mono text-[9px] text-zinc-600 dark:text-zinc-400">
                    {p.detected.length > 0 ? p.detected.join(', ') : en ? 'Not detected' : 'Belum terdeteksi'}
                  </p>
                </div>
              ))}
            </div>

            {/* SIMULATED SPEECH GENERATED BY AI */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-black/40 sm:p-5">
              <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-2.5 font-mono text-xs font-bold text-[#AD2B17] dark:border-white/10 dark:text-[#C89D54]">
                <FileTerminal className="h-4 w-4" strokeWidth={1.75} />
                <span>
                  {en
                    ? 'Simulated AI Output from Your Prompt:'
                    : 'Simulasi Output Pidato yang Dihasilkan AI:'}
                </span>
              </div>
              <p className="mt-3 font-serif text-xs italic leading-relaxed text-zinc-800 dark:text-zinc-200 sm:text-sm">
                {soloEval.simulatedOutput}
              </p>
            </div>

            {savedEntry && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-900 dark:text-emerald-200">
                {en ? 'Score saved to the ' : 'Skor Anda berhasil dicatat pada Leaderboard '}
                <strong className="font-mono">{formatSessionTag(savedEntry.session_tag, lang)}</strong>
                {leaderboardRank ? ` #${leaderboardRank}` : ''}!
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button onClick={startBattle} className="btn-secondary min-h-12 flex-1">
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> {en ? 'Try Another Prompt' : 'Tanding Ulang'}
              </button>
              <a href={ROUTE_PATHS.leaderboard} className="btn-primary min-h-12 flex-1">
                <Trophy className="h-4 w-4" strokeWidth={1.75} /> {en ? 'View Leaderboard' : 'Cek Papan Peringkat'}
              </a>
            </div>
          </div>

          {/* RIGHT: COURSES & RECOMMENDATIONS */}
          <div className="space-y-4">
            <CourseCta
              courses={[
                en
                  ? 'AI Leadership & Decision-Making for Executives'
                  : 'Kepemimpinan AI dan Pengambilan Keputusan untuk Eksekutif',
                en ? 'Data Storytelling & Visualization with AI' : 'Storytelling dan Visualisasi Data dengan AI',
                en ? 'AI in Academia for Students and Researchers' : 'AI dalam Akademik untuk Pelajar dan Mahasiswa',
              ]}
              heading={
                en
                  ? 'Master Advanced Prompting at www.naii.co'
                  : 'Perdalam Kemampuan Prompting di www.naii.co'
              }
            />
          </div>
        </div>
      ) : (
        /* DUEL COMPARISON */
        p1Eval &&
        p2Eval && (
          <div className="space-y-6">
            {/* WINNER PODIUM ANNOUNCEMENT */}
            <div className="glass relative overflow-hidden p-6 text-center sm:p-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#C89D54]/50 bg-[#C89D54]/15 shadow-sm">
                <Crown className="h-8 w-8 text-[#C89D54]" strokeWidth={2} />
              </div>
              <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
                {en ? '1V1 STAGE DUEL // PODIUM ANNOUNCEMENT' : 'HASIL RESMI DUEL PANGGUNG 1 VS 1'}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl">
                {p1Eval.score > p2Eval.score
                  ? en
                    ? `Victory for ${player?.name}!`
                    : `Kemenangan Diraih oleh ${player?.name}!`
                  : p2Eval.score > p1Eval.score
                    ? en
                      ? `Victory for ${player2Name}!`
                      : `Kemenangan Diraih oleh ${player2Name}!`
                    : en
                      ? 'Diplomatic Consensus: Deadlock Tie!'
                      : 'Konsensus Diplomatik: Hasil Imbang!'}
              </h1>
              <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-sm">
                {p1Eval.score !== p2Eval.score
                  ? en
                    ? `Won by a decisive margin of ${Math.abs(p1Eval.score - p2Eval.score)} points across the 4 NAII Prompting Pillars.`
                    : `Unggul dengan selisih ${Math.abs(p1Eval.score - p2Eval.score)} poin berdasarkan penilaian 4 Pilar Prompting NAII.`
                  : en
                    ? 'Both envoys scored identical points across the 4 pillars. Outstanding bilateral diplomatic drafting!'
                    : 'Kedua delegasi meraih total skor yang sama persis. Perumusan draf diplomasi yang luar biasa!'}
              </p>
            </div>

            {/* SIDE-BY-SIDE COMPARISON TILES */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* PLAYER 1 CARD */}
              <div
                className={`glass p-5 sm:p-7 ${
                  p1Eval.score >= p2Eval.score
                    ? 'border-[#AD2B17]/60 shadow-[0_12px_30px_-10px_rgba(173,43,23,0.3)]'
                    : 'opacity-85'
                }`}
              >
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded bg-[#AD2B17] font-mono text-[10px] font-bold text-white">
                      P1
                    </span>
                    <p className="font-extrabold text-zinc-900 dark:text-white">
                      {player?.name} {p1Eval.score > p2Eval.score && '🏆'}
                    </p>
                  </div>
                  <span className="font-mono text-2xl font-extrabold text-[#AD2B17] dark:text-[#C89D54]">
                    {p1Eval.score} <span className="text-xs text-zinc-500">PTS</span>
                  </span>
                </div>

                {/* P1 4-Pillar Score Breakdown */}
                <div className="my-3 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                  <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-white/5">
                    <span className="text-zinc-500">ROLE</span>
                    <p className="font-bold text-[#AD2B17]">{p1Eval.pillars.role.score}/25</p>
                  </div>
                  <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-white/5">
                    <span className="text-zinc-500">CONTEXT</span>
                    <p className="font-bold text-[#C89D54]">{p1Eval.pillars.context.score}/25</p>
                  </div>
                  <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-white/5">
                    <span className="text-zinc-500">LIMIT</span>
                    <p className="font-bold text-sky-600 dark:text-sky-400">{p1Eval.pillars.constraint.score}/25</p>
                  </div>
                  <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-white/5">
                    <span className="text-zinc-500">OBJECTIVE</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{p1Eval.pillars.objective.score}/25</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {en ? 'PROMPT DIRECTIVE:' : 'INSTRUKSI PROMPT:'}
                  </p>
                  <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 italic text-zinc-800 dark:border-white/10 dark:bg-black/35 dark:text-zinc-200">
                    "{p1Prompt || (en ? 'No prompt submitted' : 'Tidak ada prompt yang diinput')}"
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
                    {en ? 'GENERATED DIPLOMATIC INTERVENTION:' : 'SIMULASI PIDATO DIPLOMATIK:'}
                  </p>
                  <p className="rounded-xl border border-zinc-200 bg-white p-3 font-serif text-xs leading-relaxed text-zinc-900 dark:border-white/10 dark:bg-black/50 dark:text-zinc-100">
                    {p1Eval.simulatedOutput}
                  </p>
                </div>
              </div>

              {/* PLAYER 2 CARD */}
              <div
                className={`glass p-5 sm:p-7 ${
                  p2Eval.score >= p1Eval.score
                    ? 'border-[#C89D54]/60 shadow-[0_12px_30px_-10px_rgba(200,157,84,0.3)]'
                    : 'opacity-85'
                }`}
              >
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded bg-[#C89D54] font-mono text-[10px] font-bold text-white">
                      P2
                    </span>
                    <p className="font-extrabold text-zinc-900 dark:text-white">
                      {player2Name} {p2Eval.score > p1Eval.score && '🏆'}
                    </p>
                  </div>
                  <span className="font-mono text-2xl font-extrabold text-[#AD2B17] dark:text-[#C89D54]">
                    {p2Eval.score} <span className="text-xs text-zinc-500">PTS</span>
                  </span>
                </div>

                {/* P2 4-Pillar Score Breakdown */}
                <div className="my-3 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                  <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-white/5">
                    <span className="text-zinc-500">ROLE</span>
                    <p className="font-bold text-[#AD2B17]">{p2Eval.pillars.role.score}/25</p>
                  </div>
                  <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-white/5">
                    <span className="text-zinc-500">CONTEXT</span>
                    <p className="font-bold text-[#C89D54]">{p2Eval.pillars.context.score}/25</p>
                  </div>
                  <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-white/5">
                    <span className="text-zinc-500">LIMIT</span>
                    <p className="font-bold text-sky-600 dark:text-sky-400">{p2Eval.pillars.constraint.score}/25</p>
                  </div>
                  <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-white/5">
                    <span className="text-zinc-500">OBJECTIVE</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{p2Eval.pillars.objective.score}/25</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {en ? 'PROMPT DIRECTIVE:' : 'INSTRUKSI PROMPT:'}
                  </p>
                  <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 italic text-zinc-800 dark:border-white/10 dark:bg-black/35 dark:text-zinc-200">
                    "{p2Prompt || (en ? 'No prompt submitted' : 'Tidak ada prompt yang diinput')}"
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
                    {en ? 'GENERATED DIPLOMATIC INTERVENTION:' : 'SIMULASI PIDATO DIPLOMATIK:'}
                  </p>
                  <p className="rounded-xl border border-zinc-200 bg-white p-3 font-serif text-xs leading-relaxed text-zinc-900 dark:border-white/10 dark:bg-black/50 dark:text-zinc-100">
                    {p2Eval.simulatedOutput}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={startBattle} className="btn-primary min-h-12 !px-8">
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> {en ? 'Play Another Duel' : 'Tanding Duel Lagi'}
              </button>
              <a href={ROUTE_PATHS.home} className="btn-secondary min-h-12 !px-6">
                {en ? 'Back to Main Pavilion' : 'Kembali ke Beranda'}
              </a>
            </div>
          </div>
        )
      )}
    </div>
  )
}
