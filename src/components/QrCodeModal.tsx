import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Check, Copy, Maximize2, QrCode, Smartphone, Sparkles, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { BOOTH_GAME_URL, NAII_URL } from '../data/personas'
import { generateQrMatrix } from '../lib/qrCode'
import { NaiiStarMark } from './NaiiBrand'

/**
 * Komponen SVG QR Code tajam (100% offline, kontras tinggi hitam-di-atas-putih dengan quiet zone 3 modul)
 * agar kamera iOS & Android dapat memindai instan dari jarak jauh maupun dekat.
 */
export const QrCodeSvg = memo(function QrCodeSvg({
  value,
  className = 'h-44 w-44',
  accentColor = '#121212',
}: {
  value: string
  className?: string
  accentColor?: string
}) {
  const { pathData, totalSize } = useMemo(() => {
    try {
      const matrix = generateQrMatrix(value)
      const n = matrix.length
      const quiet = 3
      let d = ''
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (matrix[r][c]) {
            d += `M${c + quiet},${r + quiet}h1v1h-1z`
          }
        }
      }
      return { pathData: d, totalSize: n + quiet * 2 }
    } catch {
      return { pathData: '', totalSize: 27 }
    }
  }, [value])

  return (
    <svg
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR Code for ${value}`}
      className={`rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm ${className}`}
    >
      <rect width={totalSize} height={totalSize} fill="#FFFFFF" rx={1.5} />
      <path d={pathData} fill={accentColor} />
    </svg>
  )
})

const GAME_DEEP_LINKS = [
  { id: 'home', label: { id: 'Beranda', en: 'Main Hub' }, suffix: '' },
  { id: 'trivia', label: { id: 'Speed Trivia', en: 'Speed Trivia' }, suffix: '#/trivia' },
  { id: 'realvsai', label: { id: 'Real vs AI', en: 'Real vs AI' }, suffix: '#/real-vs-ai' },
  { id: 'simulator', label: { id: 'Simulator', en: 'Simulator' }, suffix: '#/simulator' },
] as const

export function QrCodeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [selectedDeepLink, setSelectedDeepLink] = useState<(typeof GAME_DEEP_LINKS)[number]['id']>('home')
  const [copiedKey, setCopiedKey] = useState<'game' | 'naii' | null>(null)
  const copyTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const activeTarget = GAME_DEEP_LINKS.find((d) => d.id === selectedDeepLink) ?? GAME_DEEP_LINKS[0]
  const fullGameUrl = `${BOOTH_GAME_URL}${activeTarget.suffix}`

  const copyUrl = async (url: string, key: 'game' | 'naii') => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedKey(key)
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopiedKey(null), 1800)
    } catch {
      /* abaikan bila clipboard diblokir */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-md animate-rise sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={en ? 'Quick Scan QR Codes' : 'Scan QR Code Akses Cepat'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="glass relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto border-[#AD2B17]/45 p-5 shadow-2xl sm:p-8">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white">
                <QrCode className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                {en ? 'ZERO-TYPING SMARTPHONE ACCESS' : 'AKSES INSTAN TANPA KETIK URL'}
              </span>
              <span className="chip !border-[#AD2B17]/45 !bg-[#AD2B17]/10 !text-[#AD2B17] dark:!text-white">
                {en ? '2 STEPS TO CLAIM PIN' : '2 LANGKAH KLAIM PIN'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
              {en
                ? 'Scan with Your Smartphone Camera'
                : 'Arahkan Kamera Smartphone Anda ke QR Code Berikut'}
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm">
              {en
                ? 'Play the interactive booth games directly on your phone and explore 20+ free AI courses at www.naii.co without typing any web address.'
                : 'Mainkan game interaktif langsung di HP Anda dan akses 20+ kursus AI gratis di www.naii.co tanpa perlu mengetik alamat web.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary !p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            aria-label={en ? 'Close QR Modal' : 'Tutup Modal QR'}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* DUAL QR GRID */}
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* QR 01: BOOTH GAME APP */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-[#AD2B17]/35 bg-[#AD2B17]/[0.04] p-5 text-center dark:border-[#AD2B17]/50 dark:bg-[#AD2B17]/[0.07]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                  <Smartphone className="h-3.5 w-3.5" />
                  {en ? 'QR 01 // PLAY ON YOUR PHONE' : 'QR 01 // MAIN DI HP ANDA'}
                </span>
                <span className="font-mono text-[10px] font-bold text-[#AD2B17] dark:text-white">
                  VERCEL LIVE APP
                </span>
              </div>

              <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-xl">
                {en ? 'NAII × CIFP 2026 Interactive Game' : 'Game Interaktif Booth NAII × CIFP 2026'}
              </h3>

              {/* Deep-link target selector */}
              <div className="grid grid-cols-4 gap-1 rounded-xl border border-zinc-200 bg-white/90 p-1 dark:border-white/10 dark:bg-black/40">
                {GAME_DEEP_LINKS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedDeepLink(item.id)}
                    className={`rounded-lg px-1.5 py-1 font-mono text-[10px] font-bold transition ${
                      selectedDeepLink === item.id
                        ? 'bg-[#AD2B17] text-white'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    {item.label[lang]}
                  </button>
                ))}
              </div>

              <div className="flex justify-center py-2">
                <QrCodeSvg value={fullGameUrl} className="h-52 w-52 sm:h-56 sm:w-56" accentColor="#3A0900" />
              </div>

              <p className="break-all rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-xs font-bold text-[#AD2B17] dark:border-white/10 dark:bg-black/50 dark:text-white">
                {fullGameUrl}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void copyUrl(fullGameUrl, 'game')}
                className="btn-secondary flex-1 !py-2.5 !text-xs"
              >
                {copiedKey === 'game' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    {en ? 'Copied!' : 'Tersalin!'}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {en ? 'Copy Game Link' : 'Salin Link Game'}
                  </>
                )}
              </button>
              <a
                href={fullGameUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex-1 !py-2.5 !text-xs"
              >
                {en ? 'Open App' : 'Buka Web Game'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* QR 02: WWW.NAII.CO */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-[#AD2B17]/50 bg-[#AD2B17]/[0.05] p-5 text-center dark:border-[#AD2B17]/50 dark:bg-[#AD2B17]/[0.07]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A0900] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  {en ? 'QR 02 // 20+ FREE AI COURSES' : 'QR 02 // 20+ KURSUS AI GRATIS'}
                </span>
                <span className="font-mono text-[10px] font-bold text-[#AD2B17] dark:text-white">
                  STEP #02 · TIER 2 PIN
                </span>
              </div>

              <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-xl">
                Nusantara AI Institute (www.naii.co)
              </h3>

              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {en ? (
                  <>
                    Scan to sign up for free (<b>AI Literacy</b>, <b>AI for Business</b>, <b>AI Technicals</b>) and show
                    your account screenshot to booth staff for Stamp #02!
                  </>
                ) : (
                  <>
                    Scan untuk daftar akun gratis (<b>AI Literacy</b>, <b>AI for Business</b>, <b>AI Technical</b>), lalu
                    tunjukkan screenshot akun ke panitia untuk Stempel #02!
                  </>
                )}
              </p>

              <div className="flex justify-center py-2">
                <QrCodeSvg value={NAII_URL} className="h-52 w-52 sm:h-56 sm:w-56" accentColor="#121212" />
              </div>

              <p className="break-all rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-xs font-bold text-zinc-900 dark:border-white/10 dark:bg-black/50 dark:text-white">
                {NAII_URL}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void copyUrl(NAII_URL, 'naii')}
                className="btn-secondary flex-1 !py-2.5 !text-xs"
              >
                {copiedKey === 'naii' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    {en ? 'Copied!' : 'Tersalin!'}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {en ? 'Copy naii.co' : 'Salin Link naii.co'}
                  </>
                )}
              </button>
              <a
                href={NAII_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex-1 !py-2.5 !text-xs"
              >
                {en ? 'Visit www.naii.co' : 'Buka www.naii.co'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Kartu Seksi Dual QR Code yang bisa dipasang langsung di Beranda & Layar TV Leaderboard
 * agar pengunjung bisa langsung memindai dari jarak jauh tanpa klik apa pun.
 */
export function BoothQrShowcase({ onExpand }: { onExpand?: () => void }) {
  const { lang } = useLanguage()
  const en = lang === 'en'

  return (
    <section
      aria-label={en ? 'Smartphone QR Code Quick Access' : 'Akses Cepat QR Code Smartphone'}
      className="glass relative overflow-hidden border-[#AD2B17]/40 p-5 sm:p-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-4 dark:border-white/10 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider uppercase text-white sm:text-xs">
              <QrCode className="h-3.5 w-3.5 text-white" strokeWidth={2} />
              {en ? 'SCAN & PLAY // ZERO TYPING' : 'SCAN & MAINKAN // TANPA KETIK URL'}
            </span>
            <span className="chip !border-[#AD2B17]/45 !bg-[#AD2B17]/10 !text-[#AD2B17] dark:!text-white">
              {en ? 'STAMP FPCI · STICKER · PIN · TOTEBAG' : 'STAMP FPCI · STIKER · PIN · TOTEBAG'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
            {en
              ? 'Scan QR Code with Your Smartphone Camera'
              : 'Pindai QR Code Menggunakan Kamera Smartphone Anda'}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm">
            {en
              ? 'No need to type any URL. Scan below to play on your own phone or access 20+ free AI courses at www.naii.co.'
              : 'Tidak perlu mengetik alamat web. Scan langsung dari kamera HP Anda untuk bermain atau membuka 20+ kursus AI gratis di www.naii.co.'}
          </p>
        </div>

        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="btn-secondary shrink-0 !px-4 !py-2.5 !text-xs"
          >
            <Maximize2 className="h-3.5 w-3.5 text-[#AD2B17]" />
            {en ? 'Enlarge QR Codes (Fullscreen)' : 'Perbesar QR Code (Layar Penuh)'}
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* CARD 1: GAME WEB APP QR */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#AD2B17]/30 bg-[#AD2B17]/[0.03] p-4 dark:border-[#AD2B17]/40 dark:bg-[#AD2B17]/[0.06] sm:flex-row sm:p-5">
          <button
            type="button"
            onClick={onExpand}
            className="group relative shrink-0 transition hover:scale-[1.02]"
            title={en ? 'Click to enlarge QR code' : 'Klik untuk memperbesar QR code'}
          >
            <QrCodeSvg value={BOOTH_GAME_URL} className="h-36 w-36 sm:h-40 sm:w-40" accentColor="#3A0900" />
          </button>

          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#AD2B17] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
              <Smartphone className="h-3 w-3" />
              {en ? 'SCAN #01 // PLAY ON PHONE' : 'SCAN #01 // MAIN DI HP ANDA'}
            </span>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white sm:text-lg">
              {en ? 'Play Booth Game on Your Smartphone' : 'Buka Game Booth di Smartphone Anda'}
            </h3>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              {en
                ? 'Play Speed Trivia, Real vs AI Hallucination, or AI Crisis Simulator directly from your phone (~45 sec).'
                : 'Mainkan Speed Trivia, Real vs AI Hallucination, atau AI Crisis Simulator langsung dari browser HP Anda (~45 detik).'}
            </p>
            <p className="font-mono text-[11px] font-bold text-[#AD2B17] dark:text-white">
              naii-cifp2026-game.vercel.app
            </p>
          </div>
        </div>

        {/* CARD 2: WWW.NAII.CO QR */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#AD2B17]/45 bg-[#AD2B17]/[0.04] p-4 dark:border-[#AD2B17]/40 dark:bg-[#AD2B17]/[0.06] sm:flex-row sm:p-5">
          <button
            type="button"
            onClick={onExpand}
            className="group relative shrink-0 transition hover:scale-[1.02]"
            title={en ? 'Click to enlarge QR code' : 'Klik untuk memperbesar QR code'}
          >
            <QrCodeSvg value={NAII_URL} className="h-36 w-36 sm:h-40 sm:w-40" accentColor="#121212" />
          </button>

          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#3A0900] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
              <NaiiStarMark color="#FFFFFF" className="h-3 w-3" />
              {en ? 'SCAN #02 // 20+ FREE COURSES' : 'SCAN #02 // 20+ KURSUS GRATIS'}
            </span>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white sm:text-lg">
              {en ? 'Explore Nusantara AI Institute' : 'Portal Kursus Gratis www.naii.co'}
            </h3>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              {en
                ? 'Sign up free for AI Literacy, AI for Business, and AI Technical tracks + show screenshot for Stamp #02 (Pin).'
                : 'Daftar gratis jalur AI Literacy, AI for Business, dan AI Technical + tunjukkan screenshot untuk Stempel #02 (Pin).'}
            </p>
            <p className="font-mono text-[11px] font-bold text-zinc-900 dark:text-white">
              www.naii.co
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
