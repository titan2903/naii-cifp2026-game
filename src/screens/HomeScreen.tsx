import { memo, useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  FileTerminal,
  Globe2,
  Layers,
  Radio,
  Scale,
  ShieldAlert,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { NaiiLogo, NaiiStarMark, NaiiWatermark } from '../components/NaiiBrand'
import { useLanguage, type Lang } from '../context/LanguageContext'
import { NAII_URL } from '../data/personas'
import { ROUTE_PATHS, type Route } from '../hooks/useHashRoute'
import { fetchTodayScores, sortScores } from '../lib/storage'
import { currentSessionTag, formatSeconds, formatSessionTag } from '../lib/utils'
import type { ScoreEntry } from '../types'

const LIVE_DISPATCHES = {
  id: [
    {
      code: 'CABLE // SC-01',
      region: 'INDO-PASIFIK · SEMICONDUCTOR',
      headline: 'Embargo Chip AI & Tekanan Blok Pakta Teknologi Eksklusif',
      vector: 'Kemandirian Industri · Hilirisasi RI',
      readiness: '94.2%',
    },
    {
      code: 'CABLE // SC-02',
      region: 'MAJELIS UMUM PBB · REGULASI AI',
      headline: 'Polarisasi Traktat AI Global: Kepatuhan Ketat vs Kedaulatan Tanpa Batas',
      vector: 'Jembatan Global South · Inklusivitas',
      readiness: '91.8%',
    },
    {
      code: 'CABLE // SC-03',
      region: 'ASEAN · KEDAULATAN DATA',
      headline: 'Krisis Disinformasi Lintas Batas & Pelindungan Data Pribadi (UU PDP)',
      vector: 'Protokol Regional · Talenta Lokal',
      readiness: '96.4%',
    },
  ],
  en: [
    {
      code: 'CABLE // SC-01',
      region: 'INDO-PACIFIC · SEMICONDUCTOR',
      headline: 'AI Chip Embargo & Exclusive Tech-Bloc Alignment Pressures',
      vector: 'Industrial Autonomy · RI Downstream',
      readiness: '94.2%',
    },
    {
      code: 'CABLE // SC-02',
      region: 'UN GENERAL ASSEMBLY · AI GOVERNANCE',
      headline: 'Global AI Treaty Polarization: Strict Compliance vs Unchecked Sovereignty',
      vector: 'Global South Bridge · Inclusivity',
      readiness: '91.8%',
    },
    {
      code: 'CABLE // SC-03',
      region: 'ASEAN · DATA SOVEREIGNTY',
      headline: 'Cross-Border Deepfake Crisis & Personal Data Protection (UU PDP)',
      vector: 'Regional Protocol · Local Talent',
      readiness: '96.4%',
    },
  ],
} as const

const COPILOT_EXAMPLES = {
  id: [
    {
      id: 'brief',
      code: '01 // POLICY BRIEF',
      label: 'Policy Brief',
      fullLabel: 'Menyusun Policy Brief',
      naive: '“Rangkum isu tatanan dunia baru dan peran Indonesia.”',
      naiveResult:
        'Output normatif dan dangkal; hanya mengulang definisi multipolaritas tanpa memetakan posisi tawar strategis Republik Indonesia.',
      structured:
        '“Bertindaklah sebagai Analis Kebijakan Luar Negeri RI. Analisis teks resolusi berikut menggunakan kacamata Politik Bebas-Aktif. Susun Policy Brief 3 poin berisi: (1) Peluang strategis bagi Indonesia & Global South, (2) Risiko ketergantungan blok, dan (3) Rekomendasi sikap delegasi RI.”',
      structuredResult:
        'Menghasilkan Policy Brief terstruktur (Peluang, Risiko, Rekomendasi) yang langsung selaras dengan doktrin Bebas-Aktif.',
      metrics: ['Konteks Doktrin RI', 'Mitigasi Risiko Blok', 'Siap Sidang Pleno'],
    },
    {
      id: 'bias',
      code: '02 // MEDIA FRAMING',
      label: 'Audit Media',
      fullLabel: 'Deteksi Bias Media Global',
      naive: '“Apa isi berita tentang regulasi teknologi ini?”',
      naiveResult:
        'Sekadar merangkum ulang artikel permukaan tanpa membongkar asumsi geopolitik dan bias narasi blok kekuatan besar.',
      structured:
        '“Bandingkan dua artikel berita dari media Barat dan media Global South berikut. Identifikasi perbedaan framing, asumsi geopolitik yang tersembunyi, serta implikasinya terhadap posisi sentralitas ASEAN.”',
      structuredResult:
        'Membedah kontras narasi kedua blok secara objektif serta menyoroti ruang manuver diplomasi bagi ASEAN.',
      metrics: ['Audit Asumsi Blok', 'Sentralitas ASEAN', 'Objektivitas Tinggi'],
    },
    {
      id: 'speech',
      code: '03 // PLENARY SPEECH',
      label: 'Pidato Pleno',
      fullLabel: 'Draf Intervensi Diplomatik',
      naive: '“Buatkan pidato tentang kerja sama AI.”',
      naiveResult:
        'Nada generik dan klise; kehilangan wibawa diplomatik serta tidak menyentuh isu ketimpangan akses teknologi.',
      structured:
        '“Susun draf intervensi pembuka (2 menit) untuk forum CIFP 2026 dengan nada diplomatis, tegas, dan inklusif. Tekankan pentingnya demokratisasi literasi AI bagi negara berkembang agar tatanan dunia baru tidak meninggalkan siapa pun.”',
      structuredResult:
        'Menghasilkan naskah intervensi berwibawa dengan pesan kuat tentang keadilan akses AI bagi Global South.',
      metrics: ['Retorika Diplomatik', 'Suara Global South', 'Durasi Presisi 120d'],
    },
  ],
  en: [
    {
      id: 'brief',
      code: '01 // POLICY BRIEF',
      label: 'Policy Brief',
      fullLabel: 'Drafting a Policy Brief',
      naive: '“Summarize the new world order issue and Indonesia’s role.”',
      naiveResult:
        'Produces a generic, surface-level summary that repeats textbook multipolarity definitions without mapping Indonesia’s strategic leverage.',
      structured:
        '“Act as a Senior Indonesian Foreign Policy Analyst. Analyze the following draft resolution through the lens of Indonesia’s Independent & Active (Bebas-Aktif) doctrine. Produce a 3-point Policy Brief covering: (1) Strategic opportunities for Indonesia & the Global South, (2) Bloc-dependency risks, and (3) Actionable recommendations for the Indonesian delegation.”',
      structuredResult:
        'Delivers an executive-ready Policy Brief (Opportunities, Risks, Recommendations) directly anchored in the Bebas-Aktif doctrine.',
      metrics: ['RI Doctrine Context', 'Bloc Risk Mitigation', 'Plenary-Ready'],
    },
    {
      id: 'bias',
      code: '02 // MEDIA FRAMING',
      label: 'Media Audit',
      fullLabel: 'Global Media Bias Audit',
      naive: '“What does this news article say about tech regulation?”',
      naiveResult:
        'Merely paraphrases the surface text while missing underlying geopolitical assumptions and great-power narrative framing.',
      structured:
        '“Compare these two dispatches from Western and Global South outlets. Identify divergences in framing, unspoken geopolitical assumptions, and their strategic implications for ASEAN Centrality.”',
      structuredResult:
        'Objectively deconstructs competing bloc narratives and highlights concrete diplomatic maneuvering space for ASEAN.',
      metrics: ['Bloc Framing Audit', 'ASEAN Centrality', 'High Objectivity'],
    },
    {
      id: 'speech',
      code: '03 // PLENARY SPEECH',
      label: 'Speech Draft',
      fullLabel: 'Diplomatic Intervention',
      naive: '“Write a speech about international AI cooperation.”',
      naiveResult:
        'Sounds cliché and generic; lacks diplomatic gravitas and fails to address global disparities in technology access.',
      structured:
        '“Draft a 2-minute opening intervention for CIFP 2026 in an authoritative, diplomatic, and inclusive tone. Emphasize democratizing AI literacy across developing nations so the Next World Order leaves no country behind.”',
      structuredResult:
        'Produces a compelling diplomatic intervention championing equitable AI access for the Global South.',
      metrics: ['Diplomatic Rhetoric', 'Global South Voice', 'Precision 120s Pacing'],
    },
  ],
} as const

/**
 * Leaf Component terisolasi (React.memo) untuk Perpetual Micro-Interactions
 * agar animasi siklus kabel diplomatik tidak memicu re-render pada halaman induk.
 */
const DiplomaticSituationMonitor = memo(function DiplomaticSituationMonitor({ lang }: { lang: Lang }) {
  const [idx, setIdx] = useState(0)
  const en = lang === 'en'
  const dispatches = LIVE_DISPATCHES[lang]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIdx((prev) => (prev + 1) % dispatches.length)
    }, 3800)
    return () => window.clearInterval(timer)
  }, [dispatches.length])

  const active = dispatches[idx]

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-5">
      {/* Top radar bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#AD2B17] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#AD2B17]" />
          </span>
          <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-white/90 sm:text-[11px]">
            SITUATION MONITOR // CIFP-26
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/60">JAKARTA PLENARY</span>
      </div>

      {/* Center radar + active dispatch */}
      <div className="my-3.5 grid grid-cols-[auto_1fr] items-center gap-3.5 sm:my-4 sm:gap-4">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/15 bg-[#220600]/90 sm:h-20 sm:w-20">
          <svg viewBox="0 0 100 100" className="h-12 w-12 text-white/20 sm:h-16 sm:w-16" aria-hidden>
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="0.75" />
            <line x1="50" y1="8" x2="50" y2="92" stroke="currentColor" strokeWidth="0.75" />
          </svg>
          <div className="absolute inset-0 grid place-items-center animate-radar">
            <NaiiStarMark color="#AD2B17" className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        </div>

        <div key={active.code} className="min-w-0 space-y-1 animate-rise">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-[#AD2B17] px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white">
              {active.code}
            </span>
            <span className="truncate font-mono text-[10px] tracking-wider text-[#C89D54]">
              {active.region}
            </span>
          </div>
          <p className="line-clamp-2 text-xs font-bold leading-snug text-white sm:text-sm">
            {active.headline}
          </p>
          <div className="flex items-center justify-between pt-0.5 font-mono text-[10px] text-white/70 sm:text-[11px]">
            <span className="truncate">{active.vector}</span>
            <span className="ml-2 shrink-0 font-semibold text-white">{active.readiness}</span>
          </div>
        </div>
      </div>

      {/* Selector dots */}
      <div className="mb-3.5 flex items-center gap-1.5">
        {dispatches.map((item, i) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`${en ? 'Select' : 'Pilih'} ${item.code}`}
            className={`h-2 rounded-full transition-all ${
              i === idx ? 'w-8 bg-[#AD2B17]' : 'w-2.5 bg-white/25 hover:bg-white/45'
            }`}
          />
        ))}
      </div>

      {/* Bottom monospace telemetry */}
      <div className="grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-black/30 py-2 text-center sm:py-2.5">
        <div className="px-1.5">
          <p className="font-mono text-sm font-bold tabular-nums text-white sm:text-base">03</p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-white/60 sm:text-[10px]">
            {en ? 'Crises' : 'Krisis'}
          </p>
        </div>
        <div className="px-1.5">
          <p className="font-mono text-sm font-bold tabular-nums text-white sm:text-base">15</p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-white/60 sm:text-[10px]">
            {en ? 'Quiz Bank' : 'Bank Soal'}
          </p>
        </div>
        <div className="px-1.5">
          <p className="font-mono text-sm font-bold tabular-nums text-[#C89D54] sm:text-base">20+</p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-white/60 sm:text-[10px]">
            {en ? 'AI Courses' : 'Kursus AI'}
          </p>
        </div>
      </div>
    </div>
  )
})

export function HomeScreen({ navigate }: { navigate: (to: Route) => void }) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [activeCopilot, setActiveCopilot] = useState(0)
  const [topLeaders, setTopLeaders] = useState<ScoreEntry[]>([])
  const examples = COPILOT_EXAMPLES[lang]
  const example = examples[activeCopilot]
  const sessionTagLabel = formatSessionTag(currentSessionTag(), lang)

  useEffect(() => {
    let mounted = true
    void fetchTodayScores().then((scores) => {
      if (mounted) {
        const tag = currentSessionTag()
        const sessionScores = scores.filter((s) => s.session_tag === tag)
        const pool = sessionScores.length > 0 ? sessionScores : scores
        setTopLeaders(sortScores(pool).slice(0, 3))
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="relative space-y-8 animate-rise sm:space-y-12">
      {/* ASYMMETRIC SPLIT HERO — NAII Brand Guidelines (Dark Red #3A0900 + White Logo) × CIFP 2026 10th Edition */}
      <section className="relative overflow-hidden rounded-[1.5rem] border border-zinc-900/15 bg-[#3A0900] bg-diplomatic-grid p-5 text-white shadow-[0_28px_60px_-18px_rgba(58,9,0,0.55)] dark:border-white/15 sm:rounded-[2rem] sm:p-10 lg:p-12">
        <NaiiWatermark className="absolute -bottom-24 -right-24 h-72 w-72 sm:h-[30rem] sm:w-[30rem]" />

        <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[1.22fr_0.98fr] lg:gap-10">
          {/* LEFT: EDITORIAL THESIS & ACTIONS */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <NaiiLogo variant="white" className="h-7 w-auto sm:h-10" />
              <span className="h-4 w-px bg-white/25 sm:h-5" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider uppercase text-white sm:px-3 sm:text-[11px]">
                <Radio className="h-3 w-3 text-[#AD2B17]" strokeWidth={2} />
                10th CIFP 2026 · Public Diplomacy
              </span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <p className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C89D54] sm:text-xs">
                Independent &amp; Active Foreign Policy × Sovereign AI
              </p>
              <h1 className="text-2xl font-extrabold tracking-tighter leading-[1.06] text-white sm:text-5xl sm:leading-[1.02] lg:text-[3.35rem]">
                {en
                  ? 'Independent & Active in the Next World Order and Artificial Intelligence.'
                  : 'Bebas-Aktif dalam Arsitektur Dunia Baru & Kecerdasan Buatan.'}
              </h1>
            </div>

            <p className="max-w-[62ch] text-xs leading-relaxed text-white/85 sm:text-base">
              {en ? (
                <>
                  Welcome to the official interactive pavilion of <b>Nusantara AI Institute (NAII)</b> at the{' '}
                  <b>10th Conference on Indonesian Foreign Policy (CIFP 2026)</b>. Test your crisis diplomacy decisions,
                  compete in high-speed Geopolitics × AI trivia, and claim a Top 3 spot!
                </>
              ) : (
                <>
                  Selamat datang di paviliun interaktif <b>Nusantara AI Institute (NAII)</b> pada{' '}
                  <b>Conference on Indonesian Foreign Policy (CIFP 2026)</b>. Uji keputusan diplomasi krisis Anda, adu
                  cepat di kuis geopolitik × AI, dan raih peringkat Top 3!
                </>
              )}
            </p>

            {/* THUMB-FRIENDLY FULL-WIDTH BUTTONS ON SMARTPHONE */}
            <div className="grid grid-cols-1 gap-2.5 pt-1 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <button
                onClick={() => navigate('simulator')}
                className="btn-primary min-h-12 w-full !px-6 !py-3.5 text-sm sm:w-auto sm:text-base"
              >
                <Globe2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{en ? 'Launch AI Crisis Simulator' : 'Mulai AI Crisis Simulator'}</span>
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => navigate('trivia')}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white px-5 py-3.5 text-sm font-bold tracking-tight text-zinc-950 transition hover:-translate-y-[1px] hover:bg-zinc-100 active:scale-[0.98] sm:w-auto sm:text-base"
              >
                <Zap className="h-4 w-4 shrink-0 text-[#AD2B17]" strokeWidth={1.75} />
                <span>{en ? 'Play Speed Trivia (60s)' : 'Main Speed Trivia (60 Detik)'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE SITUATION MONITOR */}
          <DiplomaticSituationMonitor lang={lang} />
        </div>
      </section>

      {/* QUICK 3-STEP ONBOARDING STRIP (Zero Confusion for Smartphone Visitors) */}
      <section aria-label={en ? 'Quick How-To Guide' : 'Panduan Singkat Bermain'} className="glass p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 divide-y divide-zinc-200/80 dark:divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-start gap-3 pt-1 first:pt-0 sm:px-3 sm:pt-0 first:sm:pl-0">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#AD2B17] font-mono text-xs font-bold text-white">
              01
            </span>
            <div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-white sm:text-sm">
                {en ? 'Choose a Mission Below' : 'Pilih Misi di Bawah'}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {en ? (
                  <>
                    Play <b>Crisis Simulator</b>, <b>Speed Trivia</b>, or <b>Real vs AI</b> right on your phone.
                  </>
                ) : (
                  <>
                    Mainkan <b>Crisis Simulator</b>, <b>Speed Trivia</b>, atau <b>Real vs AI</b> langsung dari ponsel.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 sm:px-4 sm:pt-0">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-zinc-200 font-mono text-xs font-bold text-zinc-800 dark:bg-white/10 dark:text-white">
              02
            </span>
            <div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-white sm:text-sm">
                {en ? 'Register Name & Institution Once' : 'Isi Nama & Kampus Sekali'}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {en
                  ? 'Your delegate profile is saved automatically across all games without re-entering.'
                  : 'Identitas delegasi otomatis tersimpan untuk seluruh permainan tanpa perlu daftar ulang.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 sm:px-3 sm:pt-0 last:sm:pr-0">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#C89D54]/25 font-mono text-xs font-bold text-[#9A6F22] dark:text-[#C89D54]">
              03
            </span>
            <div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-white sm:text-sm">
                {en ? 'Download IG Card & Claim Prizes' : 'Unduh Kartu IG & Klaim Hadiah'}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {en ? (
                  <>
                    Save your <b>Persona Card PNG</b> for IG Story &amp; reach the <b>Top 3 Leaderboard</b> each break!
                  </>
                ) : (
                  <>
                    Simpan <b>Kartu Persona PNG</b> ke IG Story &amp; raih <b>Top 3 Leaderboard</b> di sesi break!
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ASYMMETRIC BENTO 2.0 MISSION GRID (7/5 & 5/7 SPLIT) */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-col justify-between gap-1.5 border-b border-zinc-200 pb-3.5 dark:border-white/10 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-[#AD2B17] sm:text-xs">
              {en ? 'INTERACTIVE MISSIONS // 60–90 SECONDS' : 'DAFTAR PERMAINAN // 60–90 DETIK'}
            </p>
            <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              {en ? 'Select Your Interactive Mission' : 'Pilih Misi Interaktif Anda'}
            </h2>
          </div>
          <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {en ? 'TAP ANY CARD TO BEGIN' : 'KETUK SALAH SATU KARTU UNTUK MULAI BERMAIN'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
          {/* TILE 01 (7 COLS): AI CRISIS SIMULATOR */}
          <a
            href={ROUTE_PATHS.simulator}
            className="glass group relative flex flex-col justify-between overflow-hidden p-5 hover:-translate-y-0.5 hover:border-[#AD2B17]/60 sm:p-8 lg:col-span-7"
          >
            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white sm:px-3 sm:text-xs">
                  <Globe2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {en ? 'MISSION 01 // DIPLOMATIC SIMULATION' : 'MISI 01 // SIMULASI PERUNDINGAN'}
                </span>
                <span className="chip">{en ? 'OUTPUT: IG STORY CARD' : 'OUTPUT: KARTU IG STORY'}</span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-[#e25a45] sm:text-3xl">
                  Bebas-Aktif AI Crisis Simulator
                </h3>
                <p className="mt-1.5 max-w-[60ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:mt-2 sm:text-sm">
                  {en ? (
                    <>
                      Step into the role of <b>Special Envoy of the Republic of Indonesia</b> across 3 high-stakes AI
                      and geopolitical crises. Your decisions generate a downloadable{' '}
                      <b>Digital Diplomatic Persona Card</b>.
                    </>
                  ) : (
                    <>
                      Berperan sebagai <b>Utusan Khusus Republik Indonesia</b> dalam 3 skenario krisis teknologi dan
                      geopolitik. Keputusan Anda menghasilkan <b>Kartu Persona Diplomat Digital</b> siap unduh.
                    </>
                  )}
                </p>
              </div>

              {/* Mini Interactive Telemetry Preview inside Bento Tile */}
              <div className="grid gap-2.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-3.5 dark:border-white/[0.07] dark:bg-black/35 sm:grid-cols-3 sm:p-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px]">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {en ? 'AUTONOMY (BEBAS)' : 'KEMANDIRIAN (BEBAS)'}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-white">92</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                    <div className="h-full w-[92%] rounded-full bg-[#AD2B17]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px]">
                    <span className="text-zinc-500 dark:text-zinc-400">MULTILATERAL (AKTIF)</span>
                    <span className="font-bold text-zinc-900 dark:text-white">95</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                    <div className="h-full w-[95%] rounded-full bg-[#C89D54]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px]">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {en ? 'AI SOVEREIGNTY' : 'KEDAULATAN AI'}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-white">90</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                    <div className="h-full w-[90%] rounded-full bg-zinc-800 dark:bg-zinc-200" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-200/80 pt-3.5 dark:border-white/[0.08] sm:mt-6 sm:pt-4">
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {en ? 'Duration ~60s' : 'Durasi ~60 Detik'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17]/10 px-3 py-1.5 text-xs font-bold text-[#AD2B17] dark:bg-[#AD2B17]/25 dark:text-white sm:bg-transparent sm:p-0 sm:text-sm">
                {en ? 'Start Simulation' : 'Mulai Simulasi'}
                <ArrowRight className="h-4 w-4 text-[#AD2B17] transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </span>
            </div>
          </a>

          {/* TILE 02 (5 COLS): SPEED TRIVIA */}
          <a
            href={ROUTE_PATHS.trivia}
            className="glass group flex flex-col justify-between p-5 hover:-translate-y-0.5 hover:border-[#AD2B17]/60 sm:p-8 lg:col-span-5"
          >
            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-bold text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-white sm:text-xs">
                  <Zap className="h-3.5 w-3.5 text-[#AD2B17]" strokeWidth={1.75} />
                  {en ? 'MISSION 02 // SPEED QUIZ' : 'MISI 02 // KUIS CEPAT'}
                </span>
                <span className="font-mono text-xs font-bold text-[#AD2B17]">MAX 750 PTS</span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-[#e25a45] sm:text-2xl">
                  Speed Trivia: Next World Order &amp; AI
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:mt-2 sm:text-sm">
                  {en
                    ? 'Answer 5 randomized multiple-choice questions at 12 seconds per item. The faster you answer correctly, the higher your speed bonus on the Leaderboard!'
                    : 'Jawab 5 soal pilihan ganda acak dalam 12 detik per soal. Semakin cepat menjawab benar, semakin tinggi bonus poin Anda di Leaderboard!'}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-3.5 font-mono text-[11px] dark:border-white/[0.07] dark:bg-black/35 sm:text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {en ? '01. CIFP & Bebas-Aktif Doctrine' : '01. CIFP & Doktrin Bebas-Aktif'}
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{en ? '5 Items' : '5 Soal'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {en ? '02. AI Governance & Geopolitics' : '02. Tata Kelola & Geopolitik AI'}
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{en ? '5 Items' : '5 Soal'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {en ? '03. UU PDP & NAII Ecosystem' : '03. UU PDP & Ekosistem NAII'}
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{en ? '5 Items' : '5 Soal'}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-200/80 pt-3.5 dark:border-white/[0.08] sm:mt-6 sm:pt-4">
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {en ? '12s / Question' : '12 Detik / Soal'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17]/10 px-3 py-1.5 text-xs font-bold text-[#AD2B17] dark:bg-[#AD2B17]/25 dark:text-white sm:bg-transparent sm:p-0 sm:text-sm">
                {en ? 'Start Speed Quiz' : 'Mulai Kuis Cepat'}
                <ArrowRight className="h-4 w-4 text-[#AD2B17] transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </span>
            </div>
          </a>

          {/* TILE 03 (5 COLS): REAL DIPLOMACY OR AI HALLUCINATION */}
          <a
            href={ROUTE_PATHS.realvsai}
            className="glass group flex flex-col justify-between p-5 hover:-translate-y-0.5 hover:border-[#AD2B17]/60 sm:p-8 lg:col-span-5"
          >
            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-bold text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-white sm:text-xs">
                  <ShieldAlert className="h-3.5 w-3.5 text-[#AD2B17]" strokeWidth={1.75} />
                  {en ? 'MISSION 03 // FACT VS AI CHECK' : 'MISI 03 // TEBAK FAKTA VS AI'}
                </span>
                <span className="chip">{en ? '10 SEC / CLAIM' : '10 DETIK / KLAIM'}</span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-[#e25a45] sm:text-2xl">
                  Real Diplomacy or AI Hallucination?
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:mt-2 sm:text-sm">
                  {en ? (
                    <>
                      Fast 2-button verification: is this diplomatic treaty citation an <b>Authentic Fact</b> or a
                      fabricated <b>AI Hallucination</b>?
                    </>
                  ) : (
                    <>
                      Tebak cepat dengan 2 tombol: apakah kutipan traktat &amp; sejarah diplomasi ini <b>Fakta Asli</b>{' '}
                      atau karangan <b>Halusinasi AI</b>?
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 font-mono text-[10px] sm:text-[11px]">
                <div className="rounded-xl border border-emerald-600/25 bg-emerald-500/10 p-2.5 text-emerald-900 dark:border-emerald-400/25 dark:text-emerald-200 sm:p-3">
                  <p className="font-bold">{en ? '[01] DIPLOMATIC FACT' : '[01] FAKTA DIPLOMASI'}</p>
                  <p className="mt-0.5 text-[10px] opacity-80">
                    {en ? 'Verified archival treaty' : 'Arsip & traktat sah'}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-600/25 bg-rose-500/10 p-2.5 text-rose-900 dark:border-rose-400/25 dark:text-rose-200 sm:p-3">
                  <p className="font-bold">{en ? '[02] AI HALLUCINATION' : '[02] HALUSINASI AI'}</p>
                  <p className="mt-0.5 text-[10px] opacity-80">
                    {en ? 'Fabricated AI citation' : 'Pasal & klaim fiktif'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-200/80 pt-3.5 dark:border-white/[0.08] sm:mt-6 sm:pt-4">
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {en ? '5 Random Claims' : '5 Klaim Acak'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17]/10 px-3 py-1.5 text-xs font-bold text-[#AD2B17] dark:bg-[#AD2B17]/25 dark:text-white sm:bg-transparent sm:p-0 sm:text-sm">
                {en ? 'Test Your Radar' : 'Uji Ketajaman'}
                <ArrowRight className="h-4 w-4 text-[#AD2B17] transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </span>
            </div>
          </a>

          {/* TILE 04 (7 COLS): LIVE BOOTH LEADERBOARD */}
          <a
            href={ROUTE_PATHS.leaderboard}
            className="glass group flex flex-col justify-between p-5 hover:-translate-y-0.5 hover:border-[#AD2B17]/60 sm:p-8 lg:col-span-7"
          >
            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-bold text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-white sm:text-xs">
                  <Trophy className="h-3.5 w-3.5 text-[#AD2B17]" strokeWidth={1.75} />
                  {en ? 'MISSION 04 // LIVE STANDINGS' : 'MISI 04 // PAPAN PERINGKAT LIVE'}
                </span>
                <span className="chip">
                  <Activity className="h-3 w-3 text-[#AD2B17]" strokeWidth={1.75} />
                  {en ? 'SESSION' : 'SESI'}: {sessionTagLabel}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-[#e25a45] sm:text-3xl">
                  Live Leaderboard Booth NAII × CIFP 2026
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-sm">
                  {en ? (
                    <>
                      Track your standing in real time. The top three delegates of every break session (Morning, Midday,
                      Afternoon) win <b>Official NAII Grand Merchandise</b>.
                    </>
                  ) : (
                    <>
                      Pantau posisi skor Anda secara <i>real-time</i>. Tiga delegasi terbaik di setiap sesi break (Pagi,
                      Siang, Sore) berhak meraih <b>Grand Merchandise Resmi NAII</b>.
                    </>
                  )}
                </p>
              </div>

              {/* Live Standings Mini-Table */}
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-3.5 dark:border-white/[0.07] dark:bg-black/35">
                {topLeaders.length > 0 ? (
                  <div className="divide-y divide-zinc-200/70 dark:divide-white/[0.07]">
                    {topLeaders.map((item, i) => (
                      <div key={item.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-xs">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="font-mono font-bold text-[#AD2B17]">0{i + 1}</span>
                          <span className="truncate font-bold text-zinc-900 dark:text-white">{item.player_name}</span>
                          <span className="hidden truncate text-zinc-500 dark:text-zinc-400 sm:inline">
                            · {item.institution}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2.5 font-mono">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {formatSeconds(item.time_seconds, lang)}
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-white">{item.score} PTS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 py-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 sm:text-xs">
                    <span className="truncate">
                      {en
                        ? `${sessionTagLabel} is ready for its first high score.`
                        : `Sesi ${sessionTagLabel} siap menerima rekor perdana.`}
                    </span>
                    <span className="shrink-0 font-bold text-[#AD2B17]">{en ? 'CLAIM #1' : 'KLAIM #1'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-200/80 pt-3.5 dark:border-white/[0.08] sm:mt-6 sm:pt-4">
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {en ? 'Real-Time Sync' : 'Update Otomatis'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17]/10 px-3 py-1.5 text-xs font-bold text-[#AD2B17] dark:bg-[#AD2B17]/25 dark:text-white sm:bg-transparent sm:p-0 sm:text-sm">
                {en ? 'Open Standings' : 'Buka Papan Skor'}
                <ArrowRight className="h-4 w-4 text-[#AD2B17] transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* AI DIPLOMATIC CO-PILOT WORKBENCH */}
      <section className="glass overflow-hidden">
        <div className="border-b border-zinc-200/80 p-5 dark:border-white/[0.08] sm:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2">
                <FileTerminal className="h-4 w-4 text-[#AD2B17]" strokeWidth={1.75} />
                <span className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-[#AD2B17] sm:text-xs">
                  {en ? 'PROMPTING CASE STUDY // NAII METHOD' : 'STUDI KASUS PROMPTING // METODE NAII'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                {en
                  ? 'AI as a Foreign Policy Analyst Co-Pilot'
                  : 'AI Sebagai Co-Pilot Analis Kebijakan Luar Negeri'}
              </h2>
              <p className="max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-sm">
                {en ? (
                  <>
                    Tap a scenario below to compare a generic unstructured prompt against the structured analytical
                    framework taught for free at <b>www.naii.co</b>:
                  </>
                ) : (
                  <>
                    Ketuk salah satu skenario di bawah untuk membandingkan hasil <i>prompt</i> biasa dengan kerangka
                    terstruktur yang diajarkan gratis di <b>www.naii.co</b>:
                  </>
                )}
              </p>
            </div>

            {/* Mobile-Friendly 3-Grid / Segmented Task Switcher */}
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-zinc-200 bg-zinc-100/80 p-1 dark:border-white/10 dark:bg-black/40 sm:flex sm:flex-wrap sm:gap-1.5 sm:p-1.5">
              {examples.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveCopilot(idx)}
                  className={`rounded-xl px-2.5 py-2 text-center text-xs font-bold tracking-tight transition sm:px-3.5 ${
                    activeCopilot === idx
                      ? 'bg-[#AD2B17] text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">{item.label}</span>
                  <span className="hidden sm:inline">
                    <span className="mr-1.5 font-mono text-[10px] opacity-75">0{idx + 1}</span>
                    {item.fullLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Split Comparison Terminal */}
        <div className="grid divide-y divide-zinc-200/80 dark:divide-white/[0.08] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {/* LEFT: NAIVE / UNSTRUCTURED */}
          <div className="space-y-3.5 p-5 sm:space-y-4 sm:p-8">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:text-xs">
                <X className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2} />
                {en ? 'NAIVE PROMPT (UNSTRUCTURED)' : 'PROMPT BIASA (TANPA KERANGKA)'}
              </span>
              <span className="font-mono text-[10px] text-rose-600 dark:text-rose-400">
                {en ? 'LOW PRECISION' : 'KURANG TAJAM'}
              </span>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 font-mono text-xs leading-relaxed text-zinc-800 dark:border-white/[0.07] dark:bg-black/35 dark:text-zinc-200 sm:p-4 sm:text-sm">
              {example.naive}
            </div>

            <div className="space-y-1 pt-0.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {en ? 'OUTPUT WEAKNESS:' : 'KELEMAHAN HASIL:'}
              </p>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">
                {example.naiveResult}
              </p>
            </div>
          </div>

          {/* RIGHT: STRUCTURED NAII DOCTRINE */}
          <div className="space-y-3.5 bg-[#AD2B17]/[0.03] p-5 dark:bg-[#AD2B17]/[0.05] sm:space-y-4 sm:p-8">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#e25a45] sm:text-xs">
                <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                {en ? 'NAII STRUCTURED POLICY PROMPT' : 'PROMPT TERSTRUKTUR METODE NAII'}
              </span>
              <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                {en ? 'POLICY-GRADE' : 'SIAP KEBIJAKAN'}
              </span>
            </div>

            <div className="rounded-xl border border-[#AD2B17]/30 bg-white p-3.5 font-mono text-xs leading-relaxed text-zinc-900 shadow-xs dark:border-[#AD2B17]/40 dark:bg-[#0B0908] dark:text-zinc-100 sm:p-4 sm:text-sm">
              {example.structured}
            </div>

            <div className="space-y-2.5 pt-0.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
                {en ? 'STRATEGIC ADVANTAGE:' : 'KEUNGGULAN STRATEGIS:'}
              </p>
              <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-200 sm:text-sm">
                {example.structuredResult}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {example.metrics.map((m) => (
                  <span key={m} className="chip !border-[#AD2B17]/25 !bg-[#AD2B17]/10 !text-[#AD2B17] dark:!text-white">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL CONVERSION BANNER: NAII × CIFP 2026 */}
      <section className="glass relative overflow-hidden p-5 sm:p-8 lg:p-10">
        <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#AD2B17]/25 bg-[#AD2B17]/10 sm:h-16 sm:w-16">
              <NaiiStarMark color="#AD2B17" className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-semibold tracking-wider uppercase text-[#AD2B17]">
                <span>NUSANTARA AI INSTITUTE</span>
                <span>·</span>
                <span>{en ? '20+ FREE COURSES' : '20+ KURSUS GRATIS'}</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                {en
                  ? 'Build Indonesia’s Sovereign AI Talent. Learn AI, 100% Free.'
                  : 'Bangun Kedaulatan Talenta AI Indonesia. Belajar AI, Gratis.'}
              </h3>
              <p className="max-w-[64ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-sm">
                {en ? (
                  <>
                    Access structured self-paced curricula across 3 tracks: <b>AI Literacy</b> (policy, ethics, academic
                    research), <b>AI for Business</b> (organizational strategy &amp; productivity), and{' '}
                    <b>AI Technicals</b> (modern AI engineering &amp; automation).
                  </>
                ) : (
                  <>
                    Akses kurikulum terstruktur dalam 3 jalur utama: <b>AI Literacy</b> (kebijakan, etika, riset),{' '}
                    <b>AI for Business</b> (strategi &amp; produktivitas organisasi), serta <b>AI Technical</b>{' '}
                    (rekayasa model &amp; otomasi).
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <a href={NAII_URL} target="_blank" rel="noreferrer" className="btn-primary min-h-12 w-full !px-6 !py-3.5 sm:w-auto">
              <BookOpen className="h-4 w-4" strokeWidth={1.75} />
              {en ? 'Start Learning at www.naii.co' : 'Mulai Belajar di www.naii.co'}
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </a>
            <a
              href="https://www.cifp.center/"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary min-h-12 w-full !px-5 !py-3.5 sm:w-auto"
            >
              <Compass className="h-4 w-4 text-[#AD2B17]" strokeWidth={1.75} />
              {en ? 'About CIFP 2026' : 'Tentang CIFP 2026'}
            </a>
          </div>
        </div>

        {/* 3 Track Pills Footer */}
        <div className="mt-5 grid gap-3 border-t border-zinc-200/80 pt-4 dark:border-white/[0.08] sm:mt-6 sm:grid-cols-3 sm:pt-5">
          <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <Scale className="h-4 w-4 shrink-0 text-[#AD2B17]" strokeWidth={1.75} />
            <span>
              <strong className="text-zinc-900 dark:text-white">
                {en ? 'AI Literacy Track:' : 'Jalur AI Literacy:'}
              </strong>{' '}
              {en
                ? 'Ethics, governance, & policy research prompting.'
                : 'Etika, tata kelola, & prompting riset kebijakan.'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <Layers className="h-4 w-4 shrink-0 text-[#AD2B17]" strokeWidth={1.75} />
            <span>
              <strong className="text-zinc-900 dark:text-white">
                {en ? 'AI for Business Track:' : 'Jalur AI for Business:'}
              </strong>{' '}
              {en
                ? 'Workflow transformation & strategic analytics.'
                : 'Transformasi kerja & analitik strategis.'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <Sparkles className="h-4 w-4 shrink-0 text-[#AD2B17]" strokeWidth={1.75} />
            <span>
              <strong className="text-zinc-900 dark:text-white">
                {en ? 'AI Technical Track:' : 'Jalur AI Technical:'}
              </strong>{' '}
              {en
                ? 'Modern AI application & agent engineering.'
                : 'Pengembangan aplikasi & agen AI modern.'}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
