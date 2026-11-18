import { useEffect, useRef, useState, type FormEvent } from 'react'
import confetti from 'canvas-confetti'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Gift,
  Lock,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stamp,
  Ticket,
  UserCheck,
  X,
  Zap,
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { usePlayer } from '../context/PlayerContext'
import { NAII_URL } from '../data/personas'
import { ROUTE_PATHS } from '../hooks/useHashRoute'
import { formatStampScore } from '../lib/utils'
import { NaiiLogo, NaiiWatermark } from './NaiiBrand'
import { QrCodeSvg } from './QrCodeModal'

const EMAIL_RE = /^[^\s@]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/

export function PassportModal() {
  const { passport, passportOpen } = usePlayer()
  if (!passportOpen) return null
  return <PassportModalContent key={passport.ticketCode} />
}

function PassportModalContent() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const {
    player,
    passport,
    stampCount,
    setPassportOpen,
    verifyNaiiAccountByStaff,
    markTicketClaimed,
  } = usePlayer()

  const [emailInput, setEmailInput] = useState(player?.email ?? '')
  const [emailConsent, setEmailConsent] = useState(Boolean(player?.consent && player?.email))
  const [showOptionalEmail, setShowOptionalEmail] = useState(false)
  const [showNaiiQr, setShowNaiiQr] = useState(false)
  const [formError, setFormError] = useState<'email' | 'consent' | null>(null)
  const [confirmNaiiVerify, setConfirmNaiiVerify] = useState(false)
  const [confirmStaffClaim, setConfirmStaffClaim] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPassportOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setPassportOpen])

  const allUnlocked = stampCount === 2

  useEffect(() => {
    if (!allUnlocked) return
    const timer = window.setTimeout(() => {
      ticketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [allUnlocked])

  const trimmedEmail = showOptionalEmail ? emailInput.trim() : ''
  const needsEmailConsent = Boolean(trimmedEmail) && (trimmedEmail !== (player?.email ?? '') || !player?.consent)

  const handleConfirmNaiiAccount = (e: FormEvent) => {
    e.preventDefault()
    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
      setFormError('email')
      setConfirmNaiiVerify(false)
      return
    }
    if (trimmedEmail && needsEmailConsent && !emailConsent) {
      setFormError('consent')
      setConfirmNaiiVerify(false)
      return
    }
    setFormError(null)
    verifyNaiiAccountByStaff(trimmedEmail || undefined, trimmedEmail ? emailConsent || Boolean(player?.consent) : false)
    setConfirmNaiiVerify(false)
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#AD2B17', '#3A0900', '#ffffff'],
    })
  }

  const goToRoute = (href: string) => {
    setPassportOpen(false)
    window.location.hash = href
  }

  const ticketSection = (
    <div ref={ticketRef} className={allUnlocked ? 'scroll-mt-24 sm:mt-5' : 'mt-6 scroll-mt-24'}>
      {allUnlocked ? (
        /* FULL 2/2 OFFICIAL MERCHANDISE REDEMPTION TICKET */
        <div className="relative overflow-hidden rounded-2xl bg-[#3A0900] p-5 text-white sm:p-7">
          <NaiiWatermark className="absolute -bottom-16 -right-16 h-64 w-64" />

          <div className="relative z-10 space-y-5">
            {/* Top Ticket Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3.5">
              <div className="flex items-center gap-2.5">
                <NaiiLogo variant="white" className="h-6 w-auto sm:h-7" />
                <span className="h-4 w-px bg-white/25" />
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-white sm:text-xs">
                  {en ? 'OFFICIAL MERCHANDISE CLAIM TICKET' : 'TIKET KLAIM MERCHANDISE RESMI NAII'}
                </span>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-extrabold tracking-wider uppercase ${
                  passport.claimedByStaff
                    ? 'border border-zinc-400/40 bg-zinc-800 text-zinc-300'
                    : 'bg-[#AD2B17] text-white animate-pulse'
                }`}
              >
                <Ticket className="h-3.5 w-3.5" />
                {passport.claimedByStaff
                  ? en
                    ? 'REDEEMED AT BOOTH'
                    : 'SUDAH DIKLAIM DI BOOTH'
                  : en
                    ? 'VALID · SHOW TO BOOTH STAFF'
                    : 'AKTIF · TUNJUKKAN KE PANITIA BOOTH'}
              </span>
            </div>

            {/* Main Ticket Body */}
            <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-wider text-white/70">
                  {en ? 'DELEGATE CREDENTIAL' : 'IDENTITAS DELEGASI PENERIMA'}
                </p>
                <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {player?.name ?? (en ? 'CIFP 2026 Delegate' : 'Delegasi CIFP 2026')}
                </h3>
                <p className="text-xs font-medium text-white sm:text-sm">
                  {player?.institution || '10th CIFP 2026 Participant'}
                  {player?.email ? ` · ${player.email}` : ''}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
                  <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white">
                    ✓ {passport.stamp1.gameLabel} ({formatStampScore(passport.stamp1.gameLabel, passport.stamp1.score)})
                  </span>
                  <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white">
                    ✓ {en ? 'www.naii.co Verified' : 'Akun naii.co Terverifikasi'}
                  </span>
                </div>
              </div>

              {/* Ticket Code Box */}
              <div className="rounded-2xl border-2 border-dashed border-white/40 bg-black/45 px-5 py-4 text-center">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
                  {en ? 'VOUCHER CODE' : 'KODE TIKET KLAIM'}
                </p>
                <p className="mt-1 font-mono text-2xl font-extrabold tracking-wider text-white sm:text-3xl">
                  {passport.ticketCode}
                </p>
                <p className="mt-1 font-mono text-[10px] text-white/70">
                  {en ? '2/2 STEPS VERIFIED' : '2/2 LANGKAH LENGKAP'}
                </p>
              </div>
            </div>

            {/* Reward Items & Staff Verification */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-white/15 bg-black/35 p-3.5 sm:flex-row sm:items-center sm:p-4">
              <div className="flex items-start gap-2.5 text-xs text-white/90">
                <Gift className="mt-0.5 h-4 w-4 shrink-0 text-white" strokeWidth={2} />
                <div>
                  <p className="font-bold text-white">
                    {en
                      ? 'Tier 1 Sticker + FPCI Stamp & Tier 2 Official NAII Pin'
                      : 'Tier 1 Stiker + Stamp FPCI & Tier 2 Pin Resmi NAII'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/75">
                    {en
                      ? 'Top 3 on the Break Leaderboard earn an Official NAII Totebag (Tier 3), plus Exclusive NAII Calendar for VIPs.'
                      : 'Top 3 Leaderboard tiap sesi break berhak atas Totebag Resmi NAII (Tier 3), serta Kalender NAII untuk tamu VIP.'}
                  </p>
                </div>
              </div>

              {/* Staff Verification Action */}
              <div className="shrink-0">
                {passport.claimedByStaff ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-2 font-mono text-xs font-bold text-emerald-200">
                    <ShieldCheck className="h-4 w-4" />
                    {en ? 'Verified by Booth Staff' : 'Telah Diverifikasi Panitia'}
                  </div>
                ) : confirmStaffClaim ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        markTicketClaimed()
                        setConfirmStaffClaim(false)
                      }}
                      className="rounded-xl bg-emerald-600 px-3 py-2 font-mono text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      {en ? 'Confirm Pin Handover' : 'Ya, Pin Sudah Diserahkan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmStaffClaim(false)}
                      className="rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 font-mono text-xs text-white"
                    >
                      {en ? 'Cancel' : 'Batal'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmStaffClaim(true)}
                    className="rounded-xl border border-white/40 px-3.5 py-2 font-mono text-[11px] font-bold text-white transition hover:bg-white hover:text-[#3A0900]"
                  >
                    <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />
                    {en ? 'Booth Staff: Mark Claimed' : 'Verifikasi Panitia Meja Booth'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PROGRESS BANNER WHEN < 2 STAMPS */
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200/90 bg-zinc-50/90 p-4 dark:border-white/10 dark:bg-black/40 sm:flex-row sm:items-center sm:p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#AD2B17]/30 bg-[#AD2B17]/10 text-[#AD2B17] dark:text-white">
              {passport.stamp1.unlocked ? <Award className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-white sm:text-sm">
                {passport.stamp1.unlocked
                  ? en
                    ? 'Tier 1 Unlocked! Show this screen to booth staff now for your FPCI Stamp + Sticker, or complete Step #02 for the NAII Pin.'
                    : 'Tier 1 Terbuka! Tunjukkan layar ini ke panitia sekarang untuk Stamp FPCI + Stiker, atau selesaikan Langkah #02 untuk Pin Resmi NAII.'
                  : passport.stamp2.unlocked
                    ? en
                      ? 'www.naii.co Account Verified! Complete 1 short game (Step #01) to claim your Tier 1 Sticker & Tier 2 Pin.'
                      : 'Akun www.naii.co Terverifikasi! Selesaikan 1 game singkat (Langkah #01) untuk klaim Stiker Tier 1 & Tiket Pin Tier 2.'
                    : en
                      ? 'Complete 1 short game + verify your www.naii.co account to unlock your Merchandise Ticket!'
                      : 'Selesaikan 1 game singkat + verifikasi akun www.naii.co untuk menerbitkan Tiket Klaim Merchandise!'}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {en
                  ? 'Ticket Code activates automatically once both steps are verified (Tier 1: Sticker · Tier 2: Pin · Tier 3 Top 3: Totebag).'
                  : 'Kode Tiket aktif otomatis setelah 2 langkah terverifikasi (Tier 1: Stiker · Tier 2: Pin · Tier 3 Top 3: Totebag).'}
              </p>
            </div>
          </div>

          <div className="shrink-0 font-mono text-xs font-bold text-[#AD2B17] dark:text-white">
            {stampCount}/2 {en ? 'DONE' : 'SELESAI'}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-md animate-rise sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={en ? 'NAII Booth Passport & Claim Ticket' : 'Paspor Misi & Tiket Klaim Merchandise NAII'}
      onClick={(e) => {
        if (e.target === e.currentTarget) setPassportOpen(false)
      }}
    >
      <div className="glass relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto border-[#AD2B17]/40 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:p-8">
        {/* STICKY TOP HEADER ON MOBILE */}
        <div className="sticky top-0 z-20 -mx-5 -mt-5 mb-4 flex items-start justify-between gap-3 border-b border-zinc-200 bg-white/95 px-5 pb-3.5 pt-4 backdrop-blur-md dark:border-white/10 dark:bg-[#121212]/95 sm:static sm:mx-0 sm:mb-0 sm:mt-0 sm:bg-transparent sm:p-0 sm:pb-4 sm:backdrop-blur-none dark:sm:bg-transparent">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white">
                <Stamp className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                {en ? 'BOOTH PASSPORT // 2 QUICK STEPS' : 'PASPOR BOOTH // 2 LANGKAH CEPAT'}
              </span>
              <span className="chip !border-[#AD2B17]/50 !bg-[#AD2B17]/15 !text-[#AD2B17] dark:!text-white">
                {stampCount}/2 {en ? 'STEPS COMPLETED' : 'MISI SELESAI'}
              </span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
              {en
                ? 'Play 1 Short Game + Create a www.naii.co Account'
                : 'Main 1 Game Singkat + Buat Akun www.naii.co'}
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm">
              {en
                ? 'Finish 1 game for Stamp #01 (FPCI Stamp & Tier 1 Sticker), then show your www.naii.co account screenshot to booth staff for your Tier 2 Official NAII Pin.'
                : 'Selesaikan 1 game untuk Stempel #01 (Stamp FPCI & Stiker Tier 1), lalu tunjukkan screenshot akun www.naii.co ke panitia untuk Tiket Klaim Pin Resmi NAII (Tier 2).'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPassportOpen(false)}
            className="btn-secondary min-h-11 min-w-11 shrink-0 !p-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            aria-label={en ? 'Close Passport' : 'Tutup Paspor'}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* CONTENT FLOW: TICKET PROMOTED IN NATURAL DOM ORDER WHEN 2/2 UNLOCKED */}
        <div className="flex flex-col">
        {allUnlocked && ticketSection}

        {/* 2 STAMPS GRID */}
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${allUnlocked ? 'mt-5' : 'sm:mt-5'}`}>
          {/* STAMP 01: 1 SHORT GAME */}
          <div
            className={`relative flex flex-col justify-between rounded-2xl border p-4 transition sm:p-5 ${
              passport.stamp1.unlocked
                ? 'border-emerald-500/45 bg-emerald-500/[0.06] dark:border-emerald-400/35 dark:bg-emerald-500/[0.08]'
                : 'border-zinc-200/90 bg-zinc-50/70 dark:border-white/10 dark:bg-black/35'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-white">
                  {en ? 'STEP 01 // 1 SHORT GAME' : 'STEMPEL 01 // 1 GAME SINGKAT'}
                </span>
                {passport.stamp1.unlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    <CheckCircle2 className="h-3 w-3" /> {en ? 'STAMPED' : 'TERCAP'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                    <Lock className="h-3 w-3" /> {en ? 'LOCKED' : 'BELUM'}
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                {en ? 'FPCI Stamp & Tier 1 Sticker' : 'Stamp FPCI & Stiker (Tier 1)'}
              </h3>

              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {passport.stamp1.unlocked ? (
                  <>
                    {en ? 'Completed ' : 'Selesai memainkan '}
                    <b className="text-zinc-900 dark:text-white">{passport.stamp1.gameLabel}</b> (
                    {formatStampScore(passport.stamp1.gameLabel, passport.stamp1.score)}).{' '}
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {en
                        ? 'Eligible for FPCI Stamp + Exclusive NAII Sticker!'
                        : 'Berhak atas Stamp FPCI + Stiker Eksklusif NAII!'}
                    </span>
                  </>
                ) : en ? (
                  'Complete just 1 short game: Speed Trivia, Real vs AI Hallucination, or AI Crisis Simulator (~45 sec).'
                ) : (
                  'Cukup selesaikan 1 game singkat: Speed Trivia, Real vs AI Hallucination, atau AI Crisis Simulator (~45 detik).'
                )}
              </p>
            </div>

            <div className="mt-4 border-t border-zinc-200/70 pt-3 dark:border-white/10">
              {passport.stamp1.unlocked ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      goToRoute(
                        passport.stamp1.gameLabel === 'Real vs AI' ? ROUTE_PATHS.realvsai : ROUTE_PATHS.trivia,
                      )
                    }
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-300"
                  >
                    {en ? 'Play Again for Top 3 Totebag' : 'Main Lagi (Kejar Totebag Top 3)'}{' '}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => goToRoute(ROUTE_PATHS.trivia)}
                    className="btn-primary !px-3 !py-2 !text-xs"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Speed Trivia
                  </button>
                  <button
                    type="button"
                    onClick={() => goToRoute(ROUTE_PATHS.realvsai)}
                    className="btn-secondary !px-3 !py-2 !text-xs"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-[#AD2B17]" />
                    Real vs AI
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* STAMP 02: NAII.CO ACCOUNT VERIFIED BY STAFF (SCREENSHOT CHECK) */}
          <div
            className={`relative flex flex-col justify-between rounded-2xl border p-4 transition sm:p-5 ${
              passport.stamp2.unlocked
                ? 'border-emerald-500/45 bg-emerald-500/[0.06] dark:border-emerald-400/35 dark:bg-emerald-500/[0.08]'
                : 'border-[#AD2B17]/55 bg-[#AD2B17]/[0.06] dark:border-[#AD2B17]/40 dark:bg-[#AD2B17]/[0.06]'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-white">
                  {en ? 'STEP 02 // WWW.NAII.CO ACCOUNT' : 'STEMPEL 02 // AKUN WWW.NAII.CO'}
                </span>
                {passport.stamp2.unlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    <CheckCircle2 className="h-3 w-3" /> {en ? 'VERIFIED' : 'TERVERIFIKASI'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#AD2B17] dark:text-white">
                    <UserCheck className="h-3 w-3" /> {en ? 'STAFF VERIFY' : 'CEK PANITIA'}
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                {en ? 'Free Account Verification (Tier 2 Pin)' : 'Verifikasi Akun naii.co (Pin Tier 2)'}
              </h3>

              {passport.stamp2.unlocked ? (
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {en
                    ? 'Your www.naii.co account has been verified by NAII booth staff!'
                    : 'Akun www.naii.co Anda telah diverifikasi langsung oleh panitia booth NAII!'}
                </p>
              ) : (
                <form onSubmit={handleConfirmNaiiAccount} className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={NAII_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-between rounded-lg border border-[#AD2B17]/30 bg-white px-3 py-2 font-mono text-xs font-bold text-[#AD2B17] hover:bg-zinc-50 dark:bg-black/50 dark:text-white"
                    >
                      <span>1. {en ? 'Sign Up Free at www.naii.co' : 'Daftar Gratis di www.naii.co'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowNaiiQr((v) => !v)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 font-mono text-xs font-bold transition ${
                        showNaiiQr
                          ? 'border-[#AD2B17] bg-[#AD2B17] text-white'
                          : 'border-[#AD2B17]/50 bg-[#AD2B17]/15 text-[#AD2B17] hover:bg-[#AD2B17]/25 dark:text-white'
                      }`}
                      title={en ? 'Toggle www.naii.co QR Code' : 'Tampilkan QR Code www.naii.co'}
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>QR</span>
                    </button>
                  </div>

                  {showNaiiQr && (
                    <div className="flex items-center gap-3 rounded-xl border border-[#AD2B17]/40 bg-white p-2.5 dark:bg-black/45">
                      <div className="shrink-0 rounded-lg border border-zinc-200 bg-white p-1.5">
                        <QrCodeSvg value={NAII_URL} className="h-20 w-20" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-white">
                          SCAN WWW.NAII.CO
                        </p>
                        <p className="text-[11px] leading-snug text-zinc-600 dark:text-zinc-300">
                          {en
                            ? 'Point another camera to open www.naii.co directly, or tap the button above.'
                            : 'Scan dari kamera HP lain atau ketuk tombol daftar gratis di atas.'}
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] leading-snug text-zinc-600 dark:text-zinc-300">
                    2.{' '}
                    {en
                      ? 'Show your www.naii.co account screenshot to booth staff, then let staff press verify below:'
                      : 'Tunjukkan screenshot akun www.naii.co ke panitia booth, lalu panitia menekan tombol verifikasi di bawah:'}
                  </p>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionalEmail((v) => !v)
                        setFormError(null)
                      }}
                      className="font-mono text-[10px] font-semibold text-zinc-500 underline decoration-dotted hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {showOptionalEmail
                        ? en
                          ? '− Hide optional email note'
                          : '− Sembunyikan catatan email'
                        : en
                          ? '+ Optional: save email for free course links'
                          : '+ Opsional: catat email akun naii.co'}
                    </button>

                    {showOptionalEmail && (
                      <div className="mt-2 space-y-2">
                        <input
                          name="naii-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          maxLength={120}
                          aria-invalid={formError === 'email'}
                          aria-label={en ? 'Registered www.naii.co email (optional)' : 'Email akun www.naii.co (opsional)'}
                          value={emailInput}
                          onChange={(e) => {
                            const val = e.target.value
                            setEmailInput(val)
                            setFormError(null)
                            if (val.trim() !== (player?.email ?? '')) {
                              setEmailConsent(false)
                            } else {
                              setEmailConsent(Boolean(player?.consent))
                            }
                          }}
                          placeholder={
                            en ? 'Email registered on www.naii.co (optional)' : 'Email terdaftar di www.naii.co (opsional)'
                          }
                          className="field !py-1.5 !px-2.5 !text-xs"
                        />
                        {trimmedEmail && needsEmailConsent && (
                          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/80 p-2 text-[10px] leading-snug text-zinc-600 dark:border-white/10 dark:bg-black/30 dark:text-zinc-300">
                            <input
                              type="checkbox"
                              checked={emailConsent}
                              onChange={(e) => {
                                setEmailConsent(e.target.checked)
                                setFormError(null)
                              }}
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#AD2B17]"
                            />
                            <span>
                              {en
                                ? 'Consent (UU PDP No. 27/2022): I agree to share my email for NAII learning info.'
                                : 'Persetujuan UU PDP (No. 27/2022): Saya setuju email ini disimpan untuk info belajar gratis NAII.'}
                            </span>
                          </label>
                        )}
                        {formError === 'email' && (
                          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                            {en
                              ? 'Enter a valid email address or leave blank.'
                              : 'Masukkan format email valid atau kosongkan.'}
                          </p>
                        )}
                        {formError === 'consent' && (
                          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                            {en
                              ? 'Please check the UU PDP consent box before saving your email.'
                              : 'Centang kotak persetujuan UU PDP terlebih dahulu jika mengisi email.'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {confirmNaiiVerify ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2">
                      <button
                        type="submit"
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 font-mono text-[11px] font-bold text-white hover:bg-emerald-500"
                      >
                        {en ? 'Confirm Screenshot OK' : 'Konfirmasi Akun Valid'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmNaiiVerify(false)}
                        className="rounded-lg border border-zinc-300 bg-white px-2.5 py-2 font-mono text-[11px] text-zinc-700 dark:border-white/20 dark:bg-black/40 dark:text-zinc-200"
                      >
                        {en ? 'Cancel' : 'Batal'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
                          setFormError('email')
                          return
                        }
                        if (trimmedEmail && needsEmailConsent && !emailConsent) {
                          setFormError('consent')
                          return
                        }
                        setFormError(null)
                        setConfirmNaiiVerify(true)
                      }}
                      className="btn-primary w-full !py-2 !text-xs"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {en ? 'Verify naii.co Account (Booth Staff)' : 'Verifikasi Akun naii.co (Panitia)'}
                    </button>
                  )}
                </form>
              )}
            </div>

            {passport.stamp2.unlocked && (
              <div className="mt-4 border-t border-zinc-200/70 pt-3 dark:border-white/10">
                <a
                  href={NAII_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  www.naii.co <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* OFFICIAL MERCHANDISE CLAIM TICKET SECTION (WHEN < 2 STAMPS) */}
        {!allUnlocked && ticketSection}
        </div>
      </div>
    </div>
  )
}
