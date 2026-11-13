import { useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Globe2,
  Plus,
  Radio,
  RotateCcw,
  Share2,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { CourseCta } from '../components/CourseCta'
import { NaiiStarMark } from '../components/NaiiBrand'
import { RequirePlayer } from '../components/PlayerGate'
import { usePlayer } from '../context/PlayerContext'
import { SCENARIOS } from '../data/scenarios'
import { ROUTE_PATHS } from '../hooks/useHashRoute'
import { evaluateDecision } from '../lib/evaluate'
import { downloadPersonaCard, sharePersonaCard } from '../lib/personaCard'
import { savePersona } from '../lib/storage'
import type { Scenario, ScenarioOption, SimulationResult, Stance } from '../types'

const STANCE_BADGE: Record<Stance, { label: string; cls: string }> = {
  positif: {
    label: 'RESPON POSITIF',
    cls: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
  },
  netral: {
    label: 'SIKAP TERBUKA / NETRAL',
    cls: 'border-zinc-400/40 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
  },
  waspada: {
    label: 'SIKAP WASPADA',
    cls: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  },
}

const BONUS_KEYWORDS = [
  'ASEAN',
  'Global South',
  'UU PDP',
  'Non-Blok',
  'Open-Source',
  'Talenta Lokal',
  'Etika AI',
  'Kedaulatan',
]

/** Indikator langkah 1–2–3 agar pengguna smartphone selalu tahu posisi mereka. */
function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: 'Pilih Krisis' },
    { num: 2, label: 'Keputusan RI' },
    { num: 3, label: 'Kartu Persona' },
  ] as const

  return (
    <div
      aria-label="Tahapan Simulasi"
      className="grid grid-cols-3 gap-1.5 rounded-2xl border border-zinc-200/90 bg-white/90 p-1.5 dark:border-white/10 dark:bg-[#140E0C]/90"
    >
      {steps.map((s) => {
        const active = currentStep === s.num
        const done = currentStep > s.num
        return (
          <div
            key={s.num}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-center text-xs font-bold transition ${
              active
                ? 'bg-[#AD2B17] text-white shadow-xs'
                : done
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <span className="font-mono text-[11px]">{done ? '✓' : `0${s.num}`}</span>
            <span className="truncate">{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function SimulatorScreen() {
  return (
    <RequirePlayer
      title="Bebas-Aktif AI Crisis Simulator"
      subtitle="Masukkan identitas delegasi Anda untuk menerbitkan Kartu Persona Diplomat Digital di akhir perundingan."
    >
      <SimulatorFlow />
    </RequirePlayer>
  )
}

function SimulatorFlow() {
  const { player } = usePlayer()
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [selectedOption, setSelectedOption] = useState<ScenarioOption | null>(null)
  const [customNote, setCustomNote] = useState('')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  const detectedLiveKeywords = useMemo(() => {
    const lower = customNote.toLowerCase()
    return BONUS_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase()))
  }, [customNote])

  const chooseScenario = (sc: Scenario) => {
    setScenario(sc)
    setSelectedOption(sc.options[0])
    setCustomNote('')
    setResult(null)
    setShareStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleKeywordChip = (kw: string) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(,\\s*)?${escaped}(\\s*,)?`, 'i')
    if (re.test(customNote)) {
      const cleaned = customNote
        .replace(re, (_m, lead, trail) => (lead && trail ? ', ' : ''))
        .replace(/^Delegasi RI menekankan prinsip\s*[,.\s]*$/i, '')
        .trim()
      setCustomNote(cleaned)
      return
    }
    const prefix = customNote.trim()
      ? `${customNote.trim()}, `
      : 'Delegasi RI menekankan prinsip '
    const nextText = `${prefix}${kw}`.slice(0, 240)
    setCustomNote(nextText)
  }

  const runSimulation = () => {
    if (!scenario || !selectedOption || !player) return
    const res = evaluateDecision(scenario, selectedOption, customNote)
    setResult(res)
    void savePersona(player, res)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (res.score >= 85) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#AD2B17', '#C89D54', '#ffffff'],
      })
    }
  }

  const resetAll = () => {
    setScenario(null)
    setSelectedOption(null)
    setCustomNote('')
    setResult(null)
    setShareStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── STEP 1: PILIH SKENARIO KRISIS (ASYMMETRIC DOSSIER BENTO) ──
  if (!scenario) {
    const [first, second, third] = SCENARIOS
    return (
      <div className="space-y-4 animate-rise sm:space-y-6">
        <StepIndicator currentStep={1} />

        {/* TOP BRIEFING HEADER */}
        <div className="glass p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white sm:px-3 sm:text-xs">
                  <Globe2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  LANGKAH 1 // PILIH SKENARIO KRISIS
                </span>
                <span className="chip">DURASI ~60 DETIK</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tighter text-zinc-900 dark:text-white sm:text-4xl">
                Bebas-Aktif AI Crisis Simulator
              </h1>
              <p className="max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
                Anda bertindak sebagai <b>Utusan Khusus Republik Indonesia</b>. Ketuk salah satu dari 3 skenario krisis
                di bawah ini untuk masuk ke meja perundingan.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 px-4 py-2.5 font-mono text-xs dark:border-white/10 dark:bg-black/40">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                DELEGASI BERTUGAS
              </p>
              <p className="mt-0.5 font-bold text-zinc-900 dark:text-white">
                {player?.name} {player?.institution ? `· ${player.institution}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* ASYMMETRIC BENTO GRID (7/5 + 12 WIDE SPLIT) */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
          {first && (
            <button
              type="button"
              onClick={() => chooseScenario(first)}
              className="glass group flex flex-col justify-between p-5 text-left hover:-translate-y-0.5 hover:border-[#AD2B17] sm:p-8 lg:col-span-7"
            >
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="chip !border-[#AD2B17]/30 !bg-[#AD2B17]/10 !text-[#AD2B17] dark:!text-white">
                    <Radio className="h-3 w-3 text-[#AD2B17]" strokeWidth={2} />
                    {first.code} // RANTAI PASOK CHIP AI
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-[#e25a45] sm:text-3xl">
                    {first.title}
                  </h2>
                  <p className="mt-1 font-mono text-xs font-semibold text-[#AD2B17] dark:text-[#C89D54]">
                    {first.subtitle}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:mt-3 sm:text-sm">
                    {first.context}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-200/80 pt-3.5 dark:border-white/[0.08] sm:mt-6 sm:pt-4">
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">3 Opsi Keputusan RI</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-3.5 py-2 text-xs font-bold text-white shadow-xs sm:text-sm">
                  Pilih Skenario Ini
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                </span>
              </div>
            </button>
          )}

          {second && (
            <button
              type="button"
              onClick={() => chooseScenario(second)}
              className="glass group flex flex-col justify-between p-5 text-left hover:-translate-y-0.5 hover:border-[#AD2B17] sm:p-8 lg:col-span-5"
            >
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="chip">{second.code}</span>
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">SIDANG PBB</span>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-[#e25a45] sm:text-2xl">
                    {second.title}
                  </h2>
                  <p className="mt-1 font-mono text-xs font-semibold text-[#AD2B17] dark:text-[#C89D54]">
                    {second.subtitle}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:mt-3 sm:text-sm">
                    {second.context}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-200/80 pt-3.5 dark:border-white/[0.08] sm:mt-6 sm:pt-4">
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">3 Opsi Keputusan RI</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-3.5 py-2 text-xs font-bold text-white shadow-xs sm:text-sm">
                  Pilih Skenario Ini
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                </span>
              </div>
            </button>
          )}

          {third && (
            <button
              type="button"
              onClick={() => chooseScenario(third)}
              className="glass group grid gap-5 p-5 text-left hover:-translate-y-0.5 hover:border-[#AD2B17] sm:gap-6 sm:p-8 lg:col-span-12 lg:grid-cols-[1.35fr_1fr] lg:items-center"
            >
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{third.code}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:text-[11px]">
                    KAWASAN ASEAN · KEAMANAN SIBER &amp; UU PDP
                  </span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-[#e25a45] sm:text-2xl">
                  {third.title}
                </h2>
                <p className="font-mono text-xs font-semibold text-[#AD2B17] dark:text-[#C89D54]">
                  {third.subtitle}
                </p>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-sm">{third.context}</p>
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-4 dark:border-white/[0.07] dark:bg-black/35 sm:p-5">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    PERTARUHAN STRATEGIS RI
                  </p>
                  <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                    Menjaga kohesi ruang publik ASEAN sekaligus menegakkan kedaulatan data warga sesuai UU No. 27 Tahun
                    2022 (UU PDP).
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200/80 pt-3 dark:border-white/10">
                  <span className="font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    KTT Darurat ASEAN
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-3.5 py-2 text-xs font-bold text-white shadow-xs sm:text-sm">
                    Pilih Skenario Ini
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                  </span>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── STEP 2: AMBIL KEPUTUSAN DIPLOMASI (SMARTPHONE-FRIENDLY FLOW) ──
  if (!result) {
    return (
      <div className="space-y-4 animate-rise sm:space-y-6">
        <StepIndicator currentStep={2} />

        <div className="flex items-center justify-between">
          <button onClick={resetAll} className="btn-secondary !px-3.5 !py-2 text-xs">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Ganti Skenario
          </button>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {scenario.code}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.28fr] lg:items-start">
          {/* LEFT COLUMN: CRISIS BRIEFING */}
          <div className="glass space-y-4 p-5 sm:p-8">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3.5 dark:border-white/10">
              <span className="chip !border-[#AD2B17]/30 !bg-[#AD2B17]/10 !text-[#AD2B17] dark:!text-white">
                <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
                BERKAS SITUASI
              </span>
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">UTUSAN KHUSUS RI</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                {scenario.title}
              </h1>
              <p className="font-mono text-xs font-semibold text-[#AD2B17] dark:text-[#C89D54]">
                {scenario.subtitle}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50 p-3.5 text-xs leading-relaxed text-zinc-700 dark:border-white/[0.08] dark:bg-black/40 dark:text-zinc-200 sm:p-4 sm:text-sm">
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                LATAR BELAKANG KRISIS:
              </p>
              {scenario.context}
            </div>
          </div>

          {/* RIGHT COLUMN: DECISION OPTIONS & ONE-TAP BONUS KEYWORDS */}
          <div className="glass space-y-5 p-5 sm:p-8">
            <div className="space-y-1">
              <p className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#AD2B17] sm:text-xs">
                PILIH SIKAP RESMI DELEGASI INDONESIA
              </p>
              <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-xl">
                {scenario.question}
              </h2>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {scenario.options.map((opt) => {
                const active = selectedOption?.id === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition active:scale-[0.99] sm:gap-3.5 sm:p-4 ${
                      active
                        ? 'border-[#AD2B17] bg-[#AD2B17]/[0.08] text-zinc-900 shadow-xs dark:border-[#AD2B17] dark:bg-[#AD2B17]/15 dark:text-white'
                        : 'border-zinc-200/90 bg-white hover:border-zinc-300 hover:bg-zinc-50/80 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:border-white/20 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold ${
                        active
                          ? 'bg-[#AD2B17] text-white'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-xs font-medium leading-relaxed sm:text-sm">{opt.text}</span>
                    {active && (
                      <CheckCircle2
                        className="ml-auto h-5 w-5 shrink-0 text-[#AD2B17] dark:text-[#e25a45]"
                        strokeWidth={1.75}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* ONE-TAP BONUS KEYWORD CHIPS + TEXTAREA */}
            <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  <Terminal className="h-3.5 w-3.5 text-[#AD2B17]" strokeWidth={1.75} />
                  Klausul Tambahan (Opsional · Bonus Poin)
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#AD2B17]">
                  +{detectedLiveKeywords.length} Kata Kunci
                </span>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ketuk tombol kata kunci di bawah untuk menyisipkan otomatis (atau ketik langsung):
              </p>

              {/* Tappable Quick-Insert Chips for Mobile Convenience */}
              <div className="flex flex-wrap gap-1.5">
                {BONUS_KEYWORDS.map((kw) => {
                  const matched = detectedLiveKeywords.includes(kw)
                  return (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => toggleKeywordChip(kw)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-semibold transition active:scale-95 ${
                        matched
                          ? 'border-[#AD2B17] bg-[#AD2B17] text-white'
                          : 'border-zinc-300 bg-zinc-100/90 text-zinc-700 hover:border-[#AD2B17] dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-300'
                      }`}
                    >
                      {matched ? (
                        <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                      ) : (
                        <Plus className="h-3 w-3 text-[#AD2B17]" strokeWidth={2} />
                      )}
                      {kw}
                    </button>
                  )
                })}
              </div>

              <textarea
                rows={2}
                maxLength={240}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ketuk kata kunci di atas atau ketik kalimat tambahan delegasi RI..."
                className="field resize-none"
              />
            </div>

            <button
              onClick={runSimulation}
              disabled={!selectedOption}
              className="btn-primary min-h-12 w-full !py-3.5 text-sm sm:text-base"
            >
              Sahkan Keputusan &amp; Lihat Kartu Persona
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP 3: HASIL ANALISIS AI & KARTU PERSONA DIPLOMAT ──
  const dims: [string, number][] = [
    ['KEMANDIRIAN (BEBAS)', result.dims.bebas],
    ['KEPEMIMPINAN MULTILATERAL (AKTIF)', result.dims.aktif],
    ['LITERASI & KEDAULATAN AI', result.dims.teknologi],
  ]

  const handleDownload = async () => {
    if (!player) return
    await downloadPersonaCard(player, result)
    setShareStatus('Kartu Persona berhasil diunduh (PNG ukuran IG Story 1080×1920).')
  }

  const handleShare = async () => {
    if (!player) return
    const mode = await sharePersonaCard(player, result)
    setShareStatus(
      mode === 'shared'
        ? 'Kartu berhasil dibagikan.'
        : 'Kartu diunduh ke perangkat Anda — siap diunggah ke IG Story / LinkedIn.',
    )
  }

  return (
    <div className="space-y-4 animate-rise sm:space-y-6">
      <StepIndicator currentStep={3} />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
        {/* VISUAL DIPLOMATIC PERSONA CARD */}
        <div
          className="glass relative overflow-hidden p-5 sm:p-8"
          style={{ borderColor: `${result.persona.accent}55` }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3.5 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <NaiiStarMark color="#AD2B17" className="h-6 w-6" />
              <div>
                <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-[#AD2B17]">
                  NAII × CIFP 2026
                </p>
                <p className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                  KARTU PERSONA DIPLOMAT DIGITAL
                </p>
              </div>
            </div>
            <span className="chip">{result.scenario.code}</span>
          </div>

          <div className="mt-5 flex flex-col items-center gap-4 sm:mt-6 sm:flex-row sm:gap-6">
            <div
              className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border-2 bg-zinc-50 shadow-inner dark:bg-black/50 sm:h-28 sm:w-28"
              style={{ borderColor: result.persona.accent }}
            >
              <div className="text-center">
                <p className="font-mono text-3xl font-extrabold tabular-nums text-zinc-900 dark:text-white sm:text-4xl">
                  {result.score}
                </p>
                <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  SKOR RI
                </p>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                DELEGASI: <strong className="text-zinc-900 dark:text-white">{player?.name}</strong>{' '}
                {player?.institution ? `· ${player.institution}` : ''}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#AD2B17] dark:text-[#C89D54] sm:text-3xl">
                {result.persona.title}
              </h2>
              <p className="mt-1 text-xs italic text-zinc-700 dark:text-zinc-200 sm:text-sm">
                “{result.persona.tagline}”
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:mt-5 sm:text-sm">
            {result.persona.description}
          </p>

          {/* 3 DIMENSIONS BARS */}
          <div className="mt-5 space-y-3 rounded-2xl border border-zinc-200/90 bg-zinc-50/90 p-3.5 dark:border-white/[0.08] dark:bg-black/40 sm:mt-6 sm:p-4">
            {dims.map(([label, val]) => (
              <div key={label} className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] font-semibold sm:text-[11px]">
                  <span className="text-zinc-600 dark:text-zinc-300">{label}</span>
                  <span className="tabular-nums text-zinc-900 dark:text-white">{val}/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${val}%`, backgroundColor: result.persona.accent }}
                  />
                </div>
              </div>
            ))}
          </div>

          {result.matchedKeywords.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>
                <b>Bonus Kata Kunci Strategis:</b> {result.matchedKeywords.join(', ')}
              </span>
            </div>
          )}

          {/* SHARE & DOWNLOAD BUTTONS */}
          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:mt-6 sm:flex sm:flex-row sm:gap-3">
            <button onClick={() => void handleDownload()} className="btn-primary min-h-12 flex-1">
              <Download className="h-4 w-4" strokeWidth={1.75} /> Unduh Kartu IG Story (PNG)
            </button>
            <button onClick={() => void handleShare()} className="btn-secondary min-h-12 flex-1">
              <Share2 className="h-4 w-4" strokeWidth={1.75} /> Bagikan Kartu
            </button>
          </div>
          {shareStatus && (
            <p className="mt-2.5 text-center font-mono text-xs font-semibold text-[#AD2B17] dark:text-[#C89D54]">
              {shareStatus}
            </p>
          )}
        </div>

        {/* REAKSI 3 BLOK DUNIA & REKOMENDASI KURSUS NAII */}
        <div className="space-y-5">
          <div className="glass space-y-4 p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-lg">
                Respons Geopolitik Tiga Poros Dunia
              </h3>
              <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">ANALISIS DAMPAK</span>
            </div>

            <div className="rounded-xl border border-[#AD2B17]/25 bg-[#AD2B17]/[0.05] p-3.5 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 sm:p-4">
              <strong className="font-mono uppercase tracking-wider text-[#AD2B17] dark:text-[#e25a45]">
                Catatan Dewan Kebijakan:
              </strong>{' '}
              {result.option.insight}
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {result.option.reactions.map((rx) => {
                const badge = STANCE_BADGE[rx.stance]
                return (
                  <div
                    key={rx.bloc}
                    className="rounded-xl border border-zinc-200/90 bg-white/80 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{rx.bloc}</span>
                      <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{rx.text}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <CourseCta
            courses={result.persona.courses}
            heading={`Kurikulum Gratis www.naii.co untuk ${result.persona.title}`}
          />

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button onClick={resetAll} className="btn-secondary min-h-12">
              <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Skenario Lain
            </button>
            <a href={ROUTE_PATHS.trivia} className="btn-primary min-h-12">
              Lanjut ke Trivia <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
