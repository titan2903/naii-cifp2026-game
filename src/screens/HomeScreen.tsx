import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  Crown,
  FileTerminal,
  Gift,
  Globe2,
  Layers,
  Medal,
  Play,
  Scale,
  ShieldAlert,
  Sparkles,
  Stamp,
  Ticket,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { NaiiStarMark, NaiiWatermark } from '../components/NaiiBrand'
import { BoothQrShowcase } from '../components/QrCodeModal'
import { useLanguage } from '../context/LanguageContext'
import { usePlayer } from '../context/PlayerContext'
import { NAII_URL } from '../data/personas'
import { getPromptMissions } from '../data/promptBattle'
import { ROUTE_PATHS } from '../hooks/useHashRoute'
import { evaluatePrompt } from '../lib/evaluatePrompt'
import { fetchTodayScores, sortScores, subscribeScores } from '../lib/storage'
import {
  currentSessionTag,
  formatSeconds,
  formatSessionTag,
  formatSessionWindow,
  formatStampScore,
  type SessionTag,
} from '../lib/utils'
import type { ScoreEntry } from '../types'

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
      naiveOutput:
        '“Tatanan dunia saat ini sedang berubah menjadi multipolar di mana banyak negara berkembang mulai tumbuh. Indonesia sebagai negara besar di Asia Tenggara perlu bekerja sama dengan semua negara untuk menjaga perdamaian dan meningkatkan pertumbuhan ekonomi nasional di masa depan.”',
      structured:
        '“Bertindaklah sebagai Analis Kebijakan Luar Negeri RI di Kemlu. Analisis teks resolusi PBB terkait tatanan dunia baru dan kedaulatan AI menggunakan kacamata Politik Bebas-Aktif. Susun Policy Brief ringkas 3 poin dengan nada tegas diplomatis berisi: (1) Peluang strategis bagi Indonesia & Global South, (2) Risiko ketergantungan blok, dan (3) Rekomendasi sikap delegasi RI.”',
      structuredResult:
        'Menghasilkan Policy Brief terstruktur (Peluang, Risiko, Rekomendasi) yang langsung selaras dengan doktrin Bebas-Aktif.',
      structuredOutput:
        '“[POLICY BRIEF KEMLU RI] (1) Peluang Strategis: Memosisikan ASEAN & Global South sebagai penyeimbang rantai pasok AI dan mineral kritis dunia. (2) Risiko Blok: Ketergantungan pada standar tertutup satu poros dapat menggerus kedaulatan data nasional (UU PDP). (3) Rekomendasi Sikap RI: Dorong klausul interoperabilitas terbuka dan transfer kapasitas talenta AI tanpa pakta eksklusif.”',
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
      naiveOutput:
        '“Artikel berita ini membahas tentang aturan baru pembatasan ekspor teknologi chip dan kecerdasan buatan. Beberapa negara mendukung aturan ini demi keamanan, sementara negara lain merasa keberatan karena dapat menghambat perdagangan global.”',
      structured:
        '“Bertindaklah sebagai Analis Kebijakan Luar Negeri RI dan Juru Bicara Kemlu. Bandingkan dua artikel berita dari media internasional mitra maju dan media Global South terkait krisis regulasi AI di Indo-Pasifik. Susun format ringkas 3 poin secara netral dan tidak memihak untuk mengidentifikasi perbedaan framing, asumsi geopolitik, serta rekomendasi kebijakan menjaga sentralitas ASEAN dan solusi damai.”',
      structuredResult:
        'Membedah kontras narasi kedua kutub secara objektif serta menyoroti ruang manuver diplomasi bagi ASEAN.',
      structuredOutput:
        '“[AUDIT FRAMING MEDIA] Media negara maju membingkai pembatasan chip sebagai ‘proteksi keamanan nasional’, dengan asumsi implisit bahwa inovasi harus dikendalikan blok aliansi. Sebaliknya, media Global South membingkainya sebagai ‘proteksionisme teknologi’. Implikasi bagi ASEAN: Indonesia perlu menjaga Sentralitas ASEAN agar kawasan tidak dijadikan arena proksi regulasi.”',
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
      naiveOutput:
        '“Selamat pagi hadirin sekalian. Kecerdasan buatan adalah teknologi yang sangat penting bagi masa depan kita. Oleh karena itu, mari kita bekerja sama agar AI dapat memberikan manfaat positif bagi seluruh umat manusia di dunia.”',
      structured:
        '“Bertindaklah sebagai Utusan Khusus Presiden RI dan Ketua Delegasi RI. Susun draf intervensi pembuka maksimal 2 menit (1 paragraf ringkas) untuk forum CIFP 2026 terkait tatanan dunia baru dan kedaulatan AI di ASEAN & Global South dengan nada diplomatis, tegas, dan inklusif. Tekankan prinsip Politik Bebas-Aktif, demokratisasi literasi AI, dan kesepakatan bersama.”',
      structuredResult:
        'Menghasilkan naskah intervensi berwibawa dengan pesan kuat tentang keadilan akses AI bagi Global South.',
      structuredOutput:
        '“Yang Mulia para delegasi CIFP 2026, arsitektur dunia baru tidak boleh dibangun di atas kesenjangan algoritma. Berpijak pada amanat Politik Bebas-Aktif, Indonesia menyerukan demokratisasi literasi dan infrastruktur AI bagi seluruh negara berkembang—agar negara-negara Global South berdiri sebagai pencipta berdaulat, bukan sekadar pasar pasif.”',
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
      naiveOutput:
        '“The global order is shifting toward multipolarity as emerging economies grow. Indonesia, as the largest country in Southeast Asia, should cooperate with all nations to maintain peace and support economic growth in the coming years.”',
      structured:
        '“Act as a Senior Foreign Policy Analyst for the Indonesian Delegation. Analyze the following UN draft resolution on the Next World Order and AI sovereignty through the lens of Indonesia’s Independent & Active (Bebas-Aktif) doctrine. Produce a concise, firm 3-point Policy Brief covering: (1) Strategic opportunities for Indonesia & the Global South, (2) Bloc-dependency risks, and (3) Actionable policy recommendation for consensus.”',
      structuredResult:
        'Delivers an executive-ready Policy Brief (Opportunities, Risks, Recommendations) directly anchored in the Bebas-Aktif doctrine.',
      structuredOutput:
        '“[KEMLU RI POLICY BRIEF] (1) Strategic Opportunity: Position ASEAN & the Global South as indispensable neutral hubs in the global AI and critical minerals supply chain. (2) Bloc Risk: Exclusive alignment with proprietary tech standards threatens national data sovereignty (UU PDP). (3) Delegation Recommendation: Champion open interoperability and AI talent capacity-building without military-tech bloc preconditions.”',
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
      naiveOutput:
        '“This news article discusses new regulations restricting exports of advanced chips and AI technology. Some countries support these rules for security reasons, while others argue they will slow down global trade.”',
      structured:
        '“Act as a Senior Foreign Policy Analyst and Diplomatic Counsel for the Indonesian Delegation. Compare these two dispatches from developed-economy and Global South outlets on Indo-Pacific AI treaty tensions. In a concise, neutral, non-aligned 3-point format, identify framing divergences, unspoken geopolitical assumptions, and a policy recommendation to uphold ASEAN Centrality and de-escalation.”',
      structuredResult:
        'Objectively deconstructs competing narratives and highlights concrete diplomatic maneuvering space for ASEAN.',
      structuredOutput:
        '“[MEDIA FRAMING AUDIT] Developed-economy outlets frame semiconductor export controls as ‘national security guardrails,’ assuming frontier AI governance belongs to selective alliances. Global South outlets frame them as ‘digital containment.’ Implication for ASEAN: Indonesia must uphold ASEAN Centrality to prevent Southeast Asia from becoming a regulatory proxy theater.”',
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
      naiveOutput:
        '“Good morning everyone. Artificial intelligence is a very important technology for our future. Therefore, let us all work together so that AI can bring positive benefits to people all around the world.”',
      structured:
        '“Act as Presidential Envoy and Head of the Indonesian Delegation. Draft a concise 2-minute opening intervention (1 paragraph) for CIFP 2026 on the Next World Order and AI sovereignty across ASEAN & the Global South in an authoritative, diplomatic tone. Emphasize Indonesia’s Independent and Active (Bebas-Aktif) doctrine, democratizing AI literacy, and multilateral consensus.”',
      structuredResult:
        'Produces a compelling diplomatic intervention championing equitable AI access for the Global South.',
      structuredOutput:
        '“Excellencies and distinguished delegates at CIFP 2026, the Next World Order must not be erected upon an algorithmic divide. Guided by our constitutional Independent and Active doctrine, Indonesia calls for the democratization of AI literacy and sovereign compute across developing nations—ensuring the Global South stands as co-architects of the digital future, not passive consumers.”',
      metrics: ['Diplomatic Rhetoric', 'Global South Voice', 'Precision 120s Pacing'],
    },
  ],
} as const

export function HomeScreen() {
  const { lang } = useLanguage()
  const { passport, stampCount, setPassportOpen, setQrModalOpen } = usePlayer()
  const en = lang === 'en'
  const [activeCopilot, setActiveCopilot] = useState(0)
  const [showLiveOutput, setShowLiveOutput] = useState(true)
  const [sandboxOpen, setSandboxOpen] = useState(false)
  const [sandboxPrompt, setSandboxPrompt] = useState('')
  const [showBoothExtras, setShowBoothExtras] = useState(false)
  const [activeSession, setActiveSession] = useState<SessionTag>(() => currentSessionTag())
  const [allScores, setAllScores] = useState<ScoreEntry[]>([])
  const [scoresLoading, setScoresLoading] = useState(true)
  const examples = COPILOT_EXAMPLES[lang]
  const example = examples[activeCopilot]
  const sessionTagLabel = formatSessionTag(activeSession, lang)
  const defaultMission = useMemo(() => getPromptMissions(lang)[0], [lang])
  const effectiveSandboxPrompt = sandboxPrompt || example.structured.replace(/^[“"]|[”"]$/g, '')
  const sandboxEval = useMemo(
    () => evaluatePrompt(effectiveSandboxPrompt, defaultMission, lang),
    [effectiveSandboxPrompt, defaultMission, lang],
  )

  useEffect(() => {
    let mounted = true
    void fetchTodayScores()
      .then((scores) => {
        if (mounted) {
          setAllScores(scores)
          setScoresLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setScoresLoading(false)
      })
    const unsub = subscribeScores((entry) => {
      setAllScores((prev) => {
        const map = new Map(prev.map((e) => [e.id, e]))
        map.set(entry.id, entry)
        return [...map.values()]
      })
    })
    const timer = window.setInterval(() => {
      const next = currentSessionTag()
      setActiveSession((curr) => (curr === next ? curr : next))
    }, 30_000)
    return () => {
      mounted = false
      window.clearInterval(timer)
      unsub()
    }
  }, [])

  const topLeaders = useMemo(
    () => sortScores(allScores.filter((s) => s.session_tag === activeSession)).slice(0, 3),
    [allScores, activeSession],
  )

  return (
    <div className="relative space-y-6 animate-rise sm:space-y-8">
      {/* 1. CLEAN INTRO BANNER: ASYMMETRIC CATCHY TAGLINE + BLUE REWARD PILLS + ORBITAL EMBLEM */}
      <section className="relative overflow-hidden rounded-xl border border-[#AD2B17]/30 bg-[#3A0900] bg-diplomatic-grid p-5 text-white sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/15"
        />
        <NaiiWatermark className="absolute -bottom-24 -right-24 h-60 w-60 opacity-65 sm:h-80 sm:w-80 lg:hidden" />

        <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[1.6fr_0.4fr]">
          <div className="space-y-3.5 sm:space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight leading-[1.1] text-white sm:text-[2.2rem] lg:text-[2.5rem]">
                {en ? (
                  <>
                    Play Games, <span className="text-white">Win Prizes!</span>
                  </>
                ) : (
                  <>
                    Main Game, <span className="text-white">Menangkan Hadiah!</span>
                  </>
                )}
              </h1>

              <p className="max-w-[62ch] text-sm leading-relaxed text-white/85 sm:text-base lg:max-w-none">
                {en
                  ? 'Pick one short game below to earn your FPCI Stamp & Sticker, then unlock booth rewards:'
                  : 'Pilih satu game singkat di bawah untuk mendapatkan Stamp FPCI & Stiker, lalu klaim hadiah booth:'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#AD2B17]/60 bg-[#3A0900]/92 px-2.5 py-1.5 text-white">
                <Stamp className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
                {en ? '1 Game → FPCI Stamp & Sticker' : '1 Game → Stamp FPCI & Stiker'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#AD2B17]/60 bg-[#3A0900]/92 px-2.5 py-1.5 text-white">
                <Ticket className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
                {en ? 'Open naii.co Account → NAII Pin' : 'Buka Akun naii.co → Pin NAII'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#AD2B17]/80 bg-[#3A0900]/95 px-2.5 py-1.5 font-bold text-white">
                <Gift className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
                {en ? 'Top 3 per Break → Totebag' : 'Top 3 per Sesi → Totebag'}
              </span>
            </div>
          </div>

          {/* DESKTOP ARCHITECTURAL ORBITAL EMBLEM */}
          <div aria-hidden className="hidden lg:flex lg:justify-end">
            <div className="relative grid h-40 w-40 place-items-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-[#AD2B17]/35 animate-globe" />
              <div className="absolute inset-3.5 rounded-full border border-white/12 bg-black/25 backdrop-blur-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
              <div className="relative flex flex-col items-center gap-1.5 text-center">
                <NaiiStarMark color="#FFFFFF" className="h-11 w-11" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/80">
                  {en ? '~45 SEC PLAY' : 'MAIN ~45 DTK'}
                </span>
              </div>
              <span className="absolute -top-1.5 rounded-full border border-[#AD2B17]/60 bg-[#3A0900] px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-white">
                {en ? '3 TIER PRIZES' : '3 HADIAH'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ASYMMETRIC GAME STAGE (1 FEATURED LEAD CARD + 2 DISTINCT STACKED CARDS) */}
      <section aria-label={en ? 'Choose a Game' : 'Pilih Permainan'} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT FEATURE ANCHOR (6 COLS): SPEED TRIVIA */}
        <a
          href={ROUTE_PATHS.trivia}
          style={{ animationDelay: '60ms' }}
          className="glass group relative flex animate-rise flex-col justify-between overflow-hidden border-[#AD2B17]/45 bg-white dark:bg-[#121212] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#AD2B17]/80  sm:p-7 lg:col-span-6"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-[#AD2B17]" />
          <span
            aria-hidden
            className="pointer-events-none absolute right-5 top-16 select-none font-mono text-[5.5rem] font-extrabold leading-none tracking-tighter text-[#AD2B17]/[0.06] dark:text-white/[0.04] sm:right-6 sm:top-20"
          >
            01
          </span>

          <div className="relative z-10 space-y-4 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#AD2B17] text-white">
                  <Zap className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#AD2B17] dark:bg-[#AD2B17]" />
                    {en ? 'FASTEST TO STAMP' : 'JALUR TERCEPAT'}
                  </span>
                  <span className="block font-mono text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    ~45–60 {en ? 'SEC' : 'DTK'} · {en ? '5 Questions' : '5 Soal Acak'}
                  </span>
                </div>
              </div>
              <span className="chip !border-[#AD2B17]/35 !bg-[#AD2B17]/10 !font-bold !text-[#AD2B17] dark:!text-white">
                MAX 750 PTS
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-white sm:text-3xl">
                Speed Trivia
              </h2>
              <p className="max-w-[46ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-sm">
                {en
                  ? 'Answer 5 rapid-fire questions on CIFP 2026, Bebas-Aktif, & AI. Speed earns bonus Leaderboard points!'
                  : 'Jawab 5 soal pilihan ganda seputar CIFP 2026, Bebas-Aktif, & AI. Kecepatan menjawab menentukan bonus poin Leaderboard!'}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-6 flex items-center justify-between gap-3 border-t border-zinc-200/80 pt-4 dark:border-white/[0.08]">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              <Stamp className="h-3.5 w-3.5 shrink-0 text-[#AD2B17] dark:text-white" strokeWidth={1.75} />
              {en ? 'Unlocks FPCI Stamp + Sticker' : 'Membuka Stamp FPCI + Stiker'}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#AD2B17] px-4 py-2 text-xs font-bold text-white transition group-hover:bg-[#be311b]">
              {en ? 'Play Trivia' : 'Main Trivia'}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
            </span>
          </div>
        </a>

        {/* RIGHT STACKED PAIR (6 COLS): REAL VS AI + SIMULATOR */}
        <div className="grid grid-cols-1 gap-4 lg:col-span-6">
          {/* GAME 2: REAL VS AI (FORENSIC NAVY ACCENT) */}
          <a
            href={ROUTE_PATHS.realvsai}
            style={{ animationDelay: '130ms' }}
            className="glass group relative flex animate-rise flex-col justify-between overflow-hidden border-l-[3.5px] border-l-[#AD2B17] bg-white dark:bg-[#121212] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#AD2B17]/70  sm:p-6"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-4 right-5 select-none font-mono text-[4.5rem] font-extrabold leading-none tracking-tighter text-[#AD2B17]/[0.07] dark:text-white/[0.05]"
            >
              02
            </span>
            <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#AD2B17]/40 bg-[#3A0900] text-white shadow-xs">
                    <ShieldAlert className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-white">
                    Real vs AI
                  </h2>
                  <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-700 dark:border-white/15 dark:bg-white/10 dark:text-zinc-200">
                    ~45 {en ? 'SEC' : 'DTK'}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#AD2B17] dark:text-white">
                    MAX 750 PTS
                  </span>
                </div>
                <p className="max-w-[48ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {en
                    ? 'Spot whether 5 diplomatic claims are real historical facts or fabricated AI hallucinations.'
                    : 'Tebak cepat 5 klaim diplomasi: fakta sejarah asli atau halusinasi AI.'}
                </p>
              </div>

              <span className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-[#AD2B17]/35 bg-[#3A0900]/10 px-4 py-2 text-xs font-bold text-[#AD2B17] transition group-hover:bg-[#3A0900] group-hover:text-white dark:bg-[#3A0900]/80 dark:text-white dark:group-hover:bg-[#AD2B17] sm:self-center">
                {en ? 'Play Now' : 'Mainkan'}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
              </span>
            </div>
          </a>

          {/* GAME 3: CRISIS SIMULATOR (IMPERIAL BRASS GOLD ACCENT) */}
          <a
            href={ROUTE_PATHS.simulator}
            style={{ animationDelay: '200ms' }}
            className="glass group relative flex animate-rise flex-col justify-between overflow-hidden border-l-[3.5px] border-l-[#AD2B17] bg-white dark:bg-[#121212] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#AD2B17]/80  sm:p-6"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-4 right-5 select-none font-mono text-[4.5rem] font-extrabold leading-none tracking-tighter text-[#AD2B17]/[0.07] dark:text-white/[0.05]"
            >
              03
            </span>
            <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#AD2B17]/50 bg-[#AD2B17] text-white shadow-xs">
                    <Globe2 className="h-4 w-4" strokeWidth={1.85} />
                  </span>
                  <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 transition-colors group-hover:text-[#AD2B17] dark:text-white dark:group-hover:text-white">
                    Simulator
                  </h2>
                  <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-700 dark:border-white/15 dark:bg-white/10 dark:text-zinc-200">
                    ~60 {en ? 'SEC' : 'DTK'}
                  </span>
                  <span className="chip !border-[#AD2B17]/55 !bg-[#AD2B17]/15 !px-2 !py-0.5 !text-[10px] !font-bold !text-[#AD2B17] dark:!text-white">
                    IG STORY CARD
                  </span>
                </div>
                <p className="max-w-[48ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {en
                    ? 'Roleplay 1 AI diplomacy crisis as Special Envoy and download your IG Story Persona Card.'
                    : 'Simulasi 1 skenario krisis diplomasi AI & unduh Kartu Persona untuk IG Story.'}
                </p>
              </div>

              <span className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-[#AD2B17]/50 bg-[#AD2B17]/15 px-4 py-2 text-xs font-bold text-[#AD2B17] transition group-hover:bg-[#AD2B17] group-hover:text-white dark:bg-[#AD2B17]/20 dark:text-white dark:group-hover:bg-[#AD2B17] dark:group-hover:text-white sm:self-center">
                {en ? 'Play Now' : 'Mainkan'}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* 3. LIVE PASSPORT PROGRESS STRIP (ONLY WHEN PLAYER HAS UNLOCKED >= 1 STAMP) */}
      {stampCount > 0 && (
        <div className="glass flex flex-col justify-between gap-3 border-l-[3.5px] border-l-[#AD2B17] px-4 py-3.5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#AD2B17] text-white">
              {stampCount === 2 ? <Ticket className="h-4 w-4" strokeWidth={2} /> : <Check className="h-4 w-4" strokeWidth={2.25} />}
            </span>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-white">
                {stampCount === 2
                  ? en
                    ? `CLAIM TICKET ACTIVE · ${passport.ticketCode}`
                    : `TIKET KLAIM AKTIF · ${passport.ticketCode}`
                  : en
                    ? 'PASSPORT 1/2 UNLOCKED · FPCI STAMP & STICKER READY'
                    : 'PASPOR 1/2 TERBUKA · STAMP FPCI & STIKER SIAP'}
              </p>
              <p className="text-xs font-bold text-zinc-900 dark:text-white sm:text-sm">
                {stampCount === 2
                  ? en
                    ? 'Show your ticket to booth staff to redeem your Official NAII Pin.'
                    : 'Tunjukkan tiket ke panitia booth untuk klaim Pin Resmi NAII.'
                  : `${passport.stamp1.gameLabel} (${formatStampScore(passport.stamp1.gameLabel, passport.stamp1.score)}) · ${
                      en ? 'Next: verify www.naii.co account → NAII Pin' : 'Lanjut: buka akun www.naii.co → Pin NAII'
                    }`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPassportOpen(true)}
            className="btn-primary min-h-10 shrink-0 !px-4 !py-2 text-xs"
          >
            {stampCount === 2 ? <Ticket className="h-4 w-4" /> : <Stamp className="h-4 w-4" />}
            <span>
              {stampCount === 2
                ? en
                  ? 'Open Claim Ticket'
                  : 'Buka Tiket Klaim'
                : en
                  ? 'Open Passport (1/2)'
                  : 'Buka Paspor (1/2)'}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* SHOWCASE LIVE LEADERBOARD CARD (ASYMMETRIC OBSIDIAN-CRIMSON PODIUM) */}
      <section className="relative overflow-hidden rounded-xl border border-[#AD2B17]/40 bg-[#3A0900] p-5 text-white sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-diplomatic-grid opacity-55" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/15"
        />

        <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[0.95fr_1.25fr] lg:gap-8">
          {/* LEFT: SESSION TELEMETRY & REWARD CTA */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                LIVE LEADERBOARD
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#AD2B17]/40 bg-black/40 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                <Activity className="h-3 w-3 text-white" strokeWidth={2} />
                {sessionTagLabel} · {formatSessionWindow(activeSession)}
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                {en ? 'Top 3 Break Session Standings' : 'Klasemen Top 3 Sesi Break'}
              </h2>
              <p className="text-xs leading-relaxed text-white/75 sm:text-sm">
                {en ? (
                  <>
                    Speed Trivia &amp; Real vs AI points compete here in real time. Finish in the{' '}
                    <b className="text-white">Top 3</b> this break to win an{' '}
                    <b className="text-white">Official NAII Totebag (Tier 3)</b>!
                  </>
                ) : (
                  <>
                    Skor Speed Trivia &amp; Real vs AI bersaing di sini secara <i>real-time</i>. Tembus{' '}
                    <b className="text-white">Top 3</b> sesi ini untuk membawa pulang{' '}
                    <b className="text-white">Totebag Resmi NAII (Tier 3)</b>!
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={ROUTE_PATHS.leaderboard}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#AD2B17] px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-[1px] hover:bg-[#be311b] active:scale-[0.98]"
              >
                <Trophy className="h-4 w-4 text-white" strokeWidth={2} />
                <span>{en ? 'Open Full Leaderboard' : 'Buka Papan Peringkat'}</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </a>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#AD2B17]/35 bg-[#AD2B17]/10 px-3 py-2 font-mono text-[11px] font-semibold text-white">
                <Gift className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
                {en ? 'Tier 3 Reward' : 'Hadiah Tier 3'}
              </span>
            </div>
          </div>

          {/* RIGHT: VISUAL PODIUM SLOTS (#01, #02, #03) WITH SKELETAL LOADING & STAGGERED CASCADE */}
          <div className="rounded-2xl border border-white/12 bg-black/40 p-3.5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-4">
            {scoresLoading ? (
              <div className="space-y-2.5" aria-busy="true">
                {[0, 1, 2].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="h-14 animate-pulse rounded-xl border border-white/10 bg-white/[0.05]"
                  />
                ))}
              </div>
            ) : topLeaders.length > 0 ? (
              <div className="space-y-2.5">
                {topLeaders.map((item, i) => {
                  const isFirst = i === 0
                  const badgeStyle = isFirst
                    ? 'bg-[#AD2B17] text-white'
                    : i === 1
                      ? 'border border-zinc-300/40 bg-zinc-200/15 text-zinc-100'
                      : 'border border-zinc-300/40 bg-zinc-200/15 text-zinc-100'
                  return (
                    <a
                      key={item.id}
                      href={ROUTE_PATHS.leaderboard}
                      style={{ animationDelay: `${i * 75}ms` }}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition animate-rise hover:bg-white/[0.08] ${
                        isFirst
                          ? 'border-[#AD2B17]/60 bg-[#AD2B17]/30'
                          : 'border-white/10 bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-xs font-extrabold ${badgeStyle}`}
                        >
                          {isFirst ? <Crown className="h-4 w-4" strokeWidth={1.75} /> : `#0${i + 1}`}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-white sm:text-sm">{item.player_name}</p>
                          <p className="truncate font-mono text-[10px] text-white/60">{item.institution}</p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right font-mono">
                        <p className={`text-sm font-extrabold tabular-nums ${isFirst ? 'text-white' : 'text-white'}`}>
                          {item.score} <span className="text-[10px] font-semibold opacity-75">PTS</span>
                        </p>
                        <p className="text-[10px] text-white/55">{formatSeconds(item.time_seconds, lang)}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2.5">
                <a
                  href={ROUTE_PATHS.trivia}
                  className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#AD2B17]/65 bg-[#AD2B17]/20 px-3.5 py-3 transition hover:border-[#AD2B17] hover:bg-[#AD2B17]/35"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#AD2B17] text-white">
                      <Crown className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-white sm:text-sm">
                        {en ? 'Podium #01 — Open to Claim!' : 'Podium #01 — Masih Kosong!'}
                      </p>
                      <p className="truncate font-mono text-[10px] text-white/75">
                        {en ? 'Play 45s Speed Trivia to take #1' : 'Main Speed Trivia 45 dtk untuk posisi #1'}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-[#AD2B17] px-2.5 py-1 font-mono text-[10px] font-extrabold text-white">
                    {en ? 'CLAIM #1' : 'KLAIM #1'}
                  </span>
                </a>

                <div className="grid grid-cols-2 gap-2.5">
                  {[2, 3].map((rank) => (
                    <a
                      key={rank}
                      href={rank === 2 ? ROUTE_PATHS.realvsai : ROUTE_PATHS.trivia}
                      className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-white/25 hover:bg-white/[0.07]"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/10 text-white/80">
                        <Medal className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-bold text-white/90">RANK #0{rank}</p>
                        <p className="truncate text-[10px] text-white/55">
                          {en ? 'Totebag slot open' : 'Slot Totebag terbuka'}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. COLLAPSED BY DEFAULT: MINI LIVE DEMO AI, DUAL QR, & CURRICULUM BANNER */}
      <section className="space-y-4">
        <button
          type="button"
          aria-expanded={showBoothExtras}
          aria-controls="booth-extras-panel"
          onClick={() => setShowBoothExtras((v) => !v)}
          className="glass flex w-full items-center justify-between gap-3 p-4 text-left transition hover:border-[#AD2B17]/45 sm:px-6 sm:py-4"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#AD2B17]/30 bg-[#AD2B17]/10 text-[#AD2B17] dark:text-white">
              <FileTerminal className="h-4.5 w-4.5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white sm:text-sm">
                  {en
                    ? 'Mini Live Demo AI, Dual QR & Free Curriculum (www.naii.co)'
                    : 'Mini Live Demo AI, QR Code & Kurikulum Gratis www.naii.co'}
                </p>
                <span className="hidden rounded-md border border-[#AD2B17]/25 bg-[#AD2B17]/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#AD2B17] dark:border-[#AD2B17]/35 dark:bg-[#AD2B17]/15 dark:text-white sm:inline-block">
                  {en ? 'INTERACTIVE' : 'INTERAKTIF'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {showBoothExtras
                  ? en
                    ? 'Tap to collapse booth demo & curriculum info'
                    : 'Ketuk untuk menutup demo AI & info kurikulum'
                  : en
                    ? 'Tap to open interactive AI prompt demo, QR codes, & 20+ free AI courses'
                    : 'Ketuk untuk membuka demo AI interaktif, QR Code booth, & 20+ kursus gratis'}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-white/10 dark:bg-black/40 dark:text-zinc-200">
            <span>{showBoothExtras ? (en ? 'Hide' : 'Tutup') : en ? 'Open' : 'Buka'}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${showBoothExtras ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {showBoothExtras && (
          <div id="booth-extras-panel" className="space-y-6 animate-rise">
            {/* AI DIPLOMATIC CO-PILOT & MINI LIVE DEMO WORKBENCH */}
            <section className="glass overflow-hidden">
        <div className="border-b border-zinc-200/80 p-5 dark:border-white/[0.08] sm:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <FileTerminal className="h-4 w-4 text-[#AD2B17]" strokeWidth={1.75} />
                <span className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-[#AD2B17] dark:text-white sm:text-xs">
                  {en
                    ? 'MINI LIVE DEMO AI // POLICY & DIPLOMACY CO-PILOT'
                    : 'MINI LIVE DEMO AI // CO-PILOT KEBIJAKAN & DIPLOMASI'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                {en
                  ? 'AI as a Foreign Policy & Diplomacy Co-Pilot'
                  : 'AI Sebagai Co-Pilot Analis Kebijakan & Diplomasi'}
              </h2>
              <p className="max-w-[65ch] text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-sm">
                {en ? (
                  <>
                    Interactive demonstration station: select a foreign policy scenario below to compare a generic
                    prompt against the structured NAII framework taught for free at <b>www.naii.co</b>:
                  </>
                ) : (
                  <>
                    Stasiun demonstrasi interaktif: pilih salah satu skenario kebijakan luar negeri di bawah untuk
                    membandingkan <i>prompt</i> biasa dengan metode terstruktur yang diajarkan gratis di{' '}
                    <b>www.naii.co</b>:
                  </>
                )}
              </p>
            </div>

            {/* Mobile-Friendly Grid / Desktop Segmented 3-Tab Switcher */}
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-zinc-200 bg-zinc-100/80 p-1 dark:border-white/10 dark:bg-black/40 sm:flex sm:flex-wrap sm:gap-1.5 sm:p-1.5">
              {examples.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveCopilot(idx)
                    setSandboxPrompt('')
                  }}
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

            {showLiveOutput && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3.5 dark:bg-rose-500/[0.06]">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  {en ? 'SIMULATED AI RESPONSE (UNSTRUCTURED):' : 'SIMULASI RESPONS AI (TANPA KERANGKA):'}
                </p>
                <p className="mt-1 text-xs italic leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {example.naiveOutput}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: STRUCTURED NAII DOCTRINE */}
          <div className="space-y-3.5 bg-[#AD2B17]/[0.03] p-5 dark:bg-[#AD2B17]/[0.05] sm:space-y-4 sm:p-8">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-white sm:text-xs">
                <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                {en ? 'NAII STRUCTURED POLICY PROMPT' : 'PROMPT TERSTRUKTUR METODE NAII'}
              </span>
              <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                {en ? 'POLICY-GRADE' : 'SIAP KEBIJAKAN'}
              </span>
            </div>

            <div className="rounded-xl border border-[#AD2B17]/30 bg-white p-3.5 font-mono text-xs leading-relaxed text-zinc-900 shadow-xs dark:border-[#AD2B17]/40 dark:bg-[#000000] dark:text-zinc-100 sm:p-4 sm:text-sm">
              {example.structured}
            </div>

            <div className="space-y-2.5 pt-0.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#AD2B17] dark:text-white">
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

            {showLiveOutput && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3.5 dark:bg-emerald-500/[0.08]">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {en ? 'SIMULATED AI RESPONSE (NAII METHOD):' : 'SIMULASI RESPONS AI (METODE NAII):'}
                </p>
                <p className="mt-1 text-xs italic leading-relaxed text-zinc-900 dark:text-zinc-100">
                  {example.structuredOutput}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* LIVE DEMO ACTION BAR & INTERACTIVE SANDBOX (NO TIMER — FOR BOOTH LAPTOP/TABLET DEMO) */}
        <div className="border-t border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-black/30 sm:px-8 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLiveOutput((v) => !v)}
                className="btn-secondary !px-3.5 !py-2 !text-xs"
              >
                <Play className="h-3.5 w-3.5 text-[#AD2B17]" strokeWidth={2} />
                {showLiveOutput
                  ? en
                    ? 'Hide Simulated AI Response'
                    : 'Sembunyikan Simulasi Output AI'
                  : en
                    ? 'Simulate Live AI Response'
                    : 'Simulasikan Respons AI Live'}
              </button>

              <button
                type="button"
                onClick={() => setSandboxOpen((v) => !v)}
                className="btn-primary !px-4 !py-2 !text-xs"
              >
                <FileTerminal className="h-3.5 w-3.5" strokeWidth={2} />
                {sandboxOpen
                  ? en
                    ? 'Close Live Prompt Sandbox'
                    : 'Tutup Sandbox Demo Prompt'
                  : en
                    ? 'Try Interactive Live Prompt Demo (No Timer)'
                    : 'Coba Demo Ketik Prompt Langsung (Tanpa Timer)'}
              </button>
            </div>

            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              {en
                ? 'BOOTH DEMO STATION // 4 NAII PILLARS: ROLE · CONTEXT · CONSTRAINT · OBJECTIVE'
                : 'STASIUN DEMO BOOTH // 4 PILAR NAII: PERAN · KONTEKS · BATASAN · TUJUAN'}
            </span>
          </div>

          {sandboxOpen && (
            <div className="mt-4 grid gap-4 rounded-2xl border border-[#AD2B17]/30 bg-white p-4 dark:border-white/15 dark:bg-[#000000] sm:p-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="home-live-sandbox"
                    className="font-mono text-xs font-bold uppercase tracking-wider text-[#AD2B17] dark:text-white"
                  >
                    {en
                      ? 'LIVE PROMPT SANDBOX (EDIT OR TYPE YOUR OWN):'
                      : 'SANDBOX DEMO PROMPT (UBAH ATAU KETIK INSTRUKSI ANDA):'}
                  </label>
                  <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setSandboxPrompt(example.naive.replace(/^[“"]|[”"]$/g, ''))}
                      className="text-zinc-600 underline hover:opacity-80 dark:text-zinc-300"
                    >
                      {en ? 'Load Naive (Grade C)' : 'Uji Prompt Biasa'}
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={() => setSandboxPrompt('')}
                      className="text-[#AD2B17] underline hover:opacity-80 dark:text-white"
                    >
                      {en ? 'Load NAII (Grade S)' : 'Muat Metode NAII'}
                    </button>
                  </div>
                </div>

                <textarea
                  id="home-live-sandbox"
                  rows={5}
                  value={effectiveSandboxPrompt}
                  onChange={(e) => setSandboxPrompt(e.target.value)}
                  className="field resize-none font-mono text-xs leading-relaxed sm:text-sm"
                />

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-black/40">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-white">
                    {en ? 'LIVE GENERATED AI PREVIEW:' : 'PRATINJAU RESPONS AI DARI PROMPT DI ATAS:'}
                  </p>
                  <p className="mt-1 text-xs italic leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {sandboxEval.grade === 'S' || sandboxEval.grade === 'A'
                      ? example.structuredOutput
                      : sandboxEval.grade === 'B'
                        ? `${example.structuredOutput} ${
                            en
                              ? '(Tip: Complete the remaining NAII pillar to unlock full Grade S precision.)'
                              : '(Tips: Lengkapi pilar NAII yang kurang untuk mencapai presisi penuh Grade S.)'
                          }`
                        : example.naiveOutput}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-black/35">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 dark:border-white/10">
                  <span className="font-mono text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200">
                    {en ? '4-PILLAR QUALITY METER' : 'METERAN KUALITAS 4 PILAR NAII'}
                  </span>
                  <span className="chip !border-[#AD2B17]/40 !bg-[#AD2B17] !text-white font-bold">
                    GRADE {sandboxEval.grade} · {sandboxEval.score}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      ['role', sandboxEval.pillars.role],
                      ['context', sandboxEval.pillars.context],
                      ['constraint', sandboxEval.pillars.constraint],
                      ['objective', sandboxEval.pillars.objective],
                    ] as const
                  ).map(([key, p]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-zinc-200 bg-white p-2.5 dark:border-white/10 dark:bg-black/40"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                        <span className="text-[#AD2B17] dark:text-white">{p.name}</span>
                        <span className="text-zinc-900 dark:text-white">{p.score}/25</span>
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">{p.feedback}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {sandboxEval.feedback}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* DUAL QR CODE SHOWCASE: PLAY ON SMARTPHONE & ACCESS WWW.NAII.CO */}
      <BoothQrShowcase onExpand={() => setQrModalOpen(true)} />

      {/* INSTITUTIONAL CONVERSION BANNER: NAII × CIFP 2026 */}
      <section className="glass relative overflow-hidden p-5 sm:p-8 lg:p-10">
        <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#AD2B17]/25 bg-[#AD2B17]/10 sm:h-16 sm:w-16">
              <NaiiStarMark color="#AD2B17" className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-semibold tracking-wider uppercase text-[#AD2B17] dark:text-white">
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
        )}
      </section>
    </div>
  )
}
