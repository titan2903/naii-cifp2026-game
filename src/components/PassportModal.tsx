import { useEffect, useState, type FormEvent } from 'react'
import confetti from 'canvas-confetti'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Compass,
  Gift,
  KeyRound,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  Stamp,
  Ticket,
  X,
  Zap,
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { usePlayer } from '../context/PlayerContext'
import { NAII_URL } from '../data/personas'
import { ROUTE_PATHS } from '../hooks/useHashRoute'
import { NaiiLogo, NaiiWatermark } from './NaiiBrand'

const VALID_CODES = new Set([
  'NAII2026',
  'CIFP2026',
  'BEBASAKTIF',
  'BEBAS-AKTIF',
  'NUSANTARA',
  'NAII',
  '3',
  'TIGA',
  'THREE',
])

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
    setQrModalOpen,
    unlockStamp3,
    markTicketClaimed,
  } = usePlayer()

  const [codeInput, setCodeInput] = useState('')
  const [emailInput, setEmailInput] = useState(player?.email ?? '')
  const [codeError, setCodeError] = useState(false)
  const [confirmStaffClaim, setConfirmStaffClaim] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPassportOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setPassportOpen])

  const allUnlocked = stampCount === 3

  const handleUnlockStamp3 = (e: FormEvent) => {
    e.preventDefault()
    const normalized = codeInput.trim().toUpperCase().replace(/\s+/g, '')
    if (!VALID_CODES.has(normalized)) {
      setCodeError(true)
      return
    }
    setCodeError(false)
    unlockStamp3(normalized, emailInput.trim() || undefined)
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#AD2B17', '#C89D54', '#ffffff'],
    })
  }

  const goToRoute = (href: string) => {
    setPassportOpen(false)
    window.location.hash = href
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-md animate-rise sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={en ? 'NAII Diplomatic Mission Passport' : 'Paspor Stempel 3 Misi NAII'}
      onClick={(e) => {
        if (e.target === e.currentTarget) setPassportOpen(false)
      }}
    >
      <div className="glass relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto border-[#C89D54]/40 p-5 shadow-2xl sm:p-8">
        {/* TOP HEADER */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#AD2B17] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white">
                <Stamp className="h-3.5 w-3.5 text-[#C89D54]" strokeWidth={2} />
                {en ? 'DIPLOMATIC PASSPORT // 3 MISSIONS' : 'PASPOR STEMPEL // 3 MISI BOOTH'}
              </span>
              <span className="chip !border-[#C89D54]/50 !bg-[#C89D54]/15 !text-[#9A6F22] dark:!text-[#C89D54]">
                {stampCount}/3 {en ? 'STAMPS COLLECTED' : 'STEMPEL TERKUMPUL'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
              {en
                ? 'Collect 3 Mission Stamps & Claim Official NAII Merchandise'
                : 'Kumpulkan 3 Stempel Misi & Klaim Merchandise Resmi NAII'}
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm">
              {en
                ? 'Complete the 3 short booth missions below to unlock your Official NAII Merchandise Redemption Ticket.'
                : 'Selesaikan 3 misi singkat di bawah ini untuk membuka Tiket Klaim Merchandise Resmi NAII di meja panitia.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPassportOpen(false)}
            className="btn-secondary !p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            aria-label={en ? 'Close Passport' : 'Tutup Paspor'}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* 3 STAMPS GRID */}
        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4">
          {/* STAMP 01: AI CRISIS SIMULATOR */}
          <div
            className={`relative flex flex-col justify-between rounded-2xl border p-4 transition ${
              passport.stamp1.unlocked
                ? 'border-emerald-500/45 bg-emerald-500/[0.06] dark:border-emerald-400/35 dark:bg-emerald-500/[0.08]'
                : 'border-zinc-200/90 bg-zinc-50/70 dark:border-white/10 dark:bg-black/35'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
                  {en ? 'STAMP 01 // PERSONA' : 'STEMPEL 01 // PERSONA'}
                </span>
                {passport.stamp1.unlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 font-mono text-[9px] font-bold text-white">
                    <CheckCircle2 className="h-3 w-3" /> {en ? 'STAMPED' : 'TERCAP'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                    <Lock className="h-3 w-3" /> {en ? 'LOCKED' : 'BELUM'}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                {en ? 'Diplomatic Persona Card' : 'Kartu Persona Diplomat'}
              </h3>

              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {passport.stamp1.unlocked ? (
                  <>
                    {en ? 'Completed as ' : 'Tercapai sebagai '}
                    <b className="text-zinc-900 dark:text-white">{passport.stamp1.personaTitle}</b> (
                    {passport.stamp1.score}/100).
                  </>
                ) : en ? (
                  'Take a stance in 1 crisis scenario in the Bebas-Aktif AI Crisis Simulator.'
                ) : (
                  'Ambil keputusan pada 1 skenario krisis di Bebas-Aktif AI Crisis Simulator.'
                )}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-zinc-200/70 dark:border-white/10">
              {passport.stamp1.unlocked ? (
                <button
                  type="button"
                  onClick={() => goToRoute(ROUTE_PATHS.simulator)}
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  {en ? 'View Persona Simulator' : 'Buka Simulator'} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToRoute(ROUTE_PATHS.simulator)}
                  className="btn-primary w-full !py-2 !text-xs"
                >
                  <Compass className="h-3.5 w-3.5" />
                  {en ? 'Play Simulator' : 'Mainkan Simulator'}
                </button>
              )}
            </div>
          </div>

          {/* STAMP 02: COMPETITIVE ARENA */}
          <div
            className={`relative flex flex-col justify-between rounded-2xl border p-4 transition ${
              passport.stamp2.unlocked
                ? 'border-emerald-500/45 bg-emerald-500/[0.06] dark:border-emerald-400/35 dark:bg-emerald-500/[0.08]'
                : 'border-zinc-200/90 bg-zinc-50/70 dark:border-white/10 dark:bg-black/35'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
                  {en ? 'STAMP 02 // CHALLENGE' : 'STEMPEL 02 // TANTANGAN'}
                </span>
                {passport.stamp2.unlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 font-mono text-[9px] font-bold text-white">
                    <CheckCircle2 className="h-3 w-3" /> {en ? 'STAMPED' : 'TERCAP'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                    <Lock className="h-3 w-3" /> {en ? 'LOCKED' : 'BELUM'}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                {en ? 'Geopolitics × AI Arena' : 'Arena Geopolitik × AI'}
              </h3>

              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {passport.stamp2.unlocked ? (
                  <>
                    {en ? 'Completed ' : 'Selesai '}
                    <b className="uppercase text-zinc-900 dark:text-white">{passport.stamp2.game}</b>{' '}
                    ({passport.stamp2.score} PTS).
                  </>
                ) : en ? (
                  'Finish 1 round of Speed Trivia, Real vs AI, or 60s Prompt Battle.'
                ) : (
                  'Selesaikan 1 ronde Speed Trivia, Real vs AI, atau 60s Prompt Battle.'
                )}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-zinc-200/70 dark:border-white/10">
              {passport.stamp2.unlocked ? (
                <button
                  type="button"
                  onClick={() => goToRoute(ROUTE_PATHS.trivia)}
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  {en ? 'Improve Score' : 'Tingkatkan Skor'} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToRoute(ROUTE_PATHS.trivia)}
                  className="btn-primary w-full !py-2 !text-xs"
                >
                  <Zap className="h-3.5 w-3.5" />
                  {en ? 'Play Speed Trivia' : 'Main Speed Trivia'}
                </button>
              )}
            </div>
          </div>

          {/* STAMP 03: BOOTH SECRET CODE / NAII.CO EXPLORATION */}
          <div
            className={`relative flex flex-col justify-between rounded-2xl border p-4 transition ${
              passport.stamp3.unlocked
                ? 'border-emerald-500/45 bg-emerald-500/[0.06] dark:border-emerald-400/35 dark:bg-emerald-500/[0.08]'
                : 'border-[#C89D54]/55 bg-[#C89D54]/[0.06] dark:border-[#C89D54]/40 dark:bg-[#C89D54]/[0.06]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AD2B17] dark:text-[#C89D54]">
                  {en ? 'STAMP 03 // BOOTH HUNT' : 'STEMPEL 03 // KODE BOOTH'}
                </span>
                {passport.stamp3.unlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 font-mono text-[9px] font-bold text-white">
                    <CheckCircle2 className="h-3 w-3" /> {en ? 'STAMPED' : 'TERCAP'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#9A6F22] dark:text-[#C89D54]">
                    <KeyRound className="h-3 w-3" /> {en ? 'ENTER CODE' : 'ISI KODE'}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                {en ? 'Explore www.naii.co & Booth Code' : 'Eksplorasi www.naii.co & Kode Booth'}
              </h3>

              {passport.stamp3.unlocked ? (
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {en ? 'Verified with Booth Passcode: ' : 'Terverifikasi dengan Kode Sandi: '}
                  <b className="font-mono text-zinc-900 dark:text-white">{passport.stamp3.codeUsed}</b>
                </p>
              ) : (
                <form onSubmit={handleUnlockStamp3} className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={NAII_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-between rounded-lg border border-[#AD2B17]/30 bg-white px-2.5 py-1.5 font-mono text-[11px] font-bold text-[#AD2B17] hover:bg-zinc-50 dark:bg-black/50 dark:text-[#C89D54]"
                    >
                      <span>1. {en ? 'Open www.naii.co' : 'Buka www.naii.co'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setPassportOpen(false)
                        setQrModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#C89D54]/50 bg-[#C89D54]/15 px-2.5 py-1.5 font-mono text-[11px] font-bold text-[#9A6F22] hover:bg-[#C89D54]/25 dark:text-[#C89D54]"
                      title={en ? 'Show QR Code' : 'Tampilkan QR Code'}
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>QR</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <label
                        htmlFor="passport-booth-code"
                        className="block font-mono text-[10px] text-zinc-600 dark:text-zinc-300"
                      >
                        {en ? '2. Booth Code:' : '2. Kode Sandi Booth:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCodeInput('NAII2026')
                          setCodeError(false)
                        }}
                        className="font-mono text-[10px] font-bold text-[#AD2B17] underline hover:opacity-80 dark:text-[#C89D54]"
                      >
                        {en ? 'Use Hint: NAII2026' : 'Pakai: NAII2026'}
                      </button>
                    </div>
                    <input
                      id="passport-booth-code"
                      type="text"
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value)
                        setCodeError(false)
                      }}
                      placeholder="NAII2026"
                      className="field mt-1 !py-1.5 !px-2.5 font-mono !text-xs uppercase"
                    />
                    {codeError && (
                      <p className="mt-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                        {en ? 'Use code: NAII2026 or CIFP2026' : 'Gunakan kode: NAII2026 atau CIFP2026'}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      aria-label={en ? 'Email for www.naii.co (optional)' : 'Email akun www.naii.co (opsional)'}
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={en ? 'Email for www.naii.co (optional)' : 'Email akun www.naii.co (opsional)'}
                      className="field !py-1.5 !px-2.5 !text-xs"
                    />
                    <p className="mt-0.5 text-[9px] text-zinc-500 dark:text-zinc-400">
                      {en
                        ? 'Protected under UU PDP for free course access at www.naii.co.'
                        : 'Dilindungi sesuai UU PDP untuk akses kursus gratis www.naii.co.'}
                    </p>
                  </div>

                  <button type="submit" className="btn-primary w-full !py-2 !text-xs">
                    <Stamp className="h-3.5 w-3.5" />
                    {en ? 'Verify & Stamp #03' : 'Verifikasi & Cap Stempel #03'}
                  </button>
                </form>
              )}
            </div>

            {passport.stamp3.unlocked && (
              <div className="mt-4 pt-2 border-t border-zinc-200/70 dark:border-white/10">
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

        {/* OFFICIAL MERCHANDISE CLAIM TICKET SECTION */}
        <div className="mt-6">
          {allUnlocked ? (
            /* FULL 3/3 OFFICIAL MERCHANDISE REDEMPTION TICKET */
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#C89D54] bg-gradient-to-br from-[#3A0900] via-[#240600] to-[#0B0908] p-5 text-white shadow-[0_20px_50px_-12px_rgba(173,43,23,0.55)] sm:p-7">
              <NaiiWatermark className="absolute -bottom-16 -right-16 h-64 w-64" />

              <div className="relative z-10 space-y-5">
                {/* Top Ticket Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <NaiiLogo variant="white" className="h-6 w-auto sm:h-7" />
                    <span className="h-4 w-px bg-white/25" />
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[#C89D54] sm:text-xs">
                      {en ? 'OFFICIAL MERCHANDISE CLAIM TICKET' : 'TIKET KLAIM MERCHANDISE RESMI NAII'}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-extrabold tracking-wider uppercase ${
                      passport.claimedByStaff
                        ? 'border border-zinc-400/40 bg-zinc-800 text-zinc-300'
                        : 'border border-emerald-400/50 bg-emerald-500/20 text-emerald-200 animate-pulse'
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
                    <p className="text-xs font-medium text-[#C89D54] sm:text-sm">
                      {player?.institution || '10th CIFP 2026 Participant'}
                      {player?.email ? ` · ${player.email}` : ''}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
                      <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white">
                        ✓ {passport.stamp1.personaTitle ?? 'Persona'}
                      </span>
                      <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white">
                        ✓ {passport.stamp2.game?.toUpperCase()} ({passport.stamp2.score} PTS)
                      </span>
                      <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white">
                        ✓ CODE: {passport.stamp3.codeUsed}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Code Box */}
                  <div className="rounded-2xl border-2 border-dashed border-[#C89D54]/70 bg-black/45 px-5 py-4 text-center backdrop-blur-xs">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#C89D54]">
                      {en ? 'VOUCHER CODE' : 'KODE TIKET KLAIM'}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-extrabold tracking-wider text-white sm:text-3xl">
                      {passport.ticketCode}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-emerald-300">
                      {en ? '3/3 STAMPS VERIFIED' : '3/3 STEMPEL LENGKAP'}
                    </p>
                  </div>
                </div>

                {/* Reward Items & Staff Verification */}
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-white/15 bg-black/35 p-3.5 sm:flex-row sm:items-center sm:p-4">
                  <div className="flex items-start gap-2.5 text-xs text-white/90">
                    <Gift className="mt-0.5 h-4 w-4 shrink-0 text-[#C89D54]" strokeWidth={2} />
                    <div>
                      <p className="font-bold text-white">
                        {en
                          ? 'Tier 1 & Tier 2 Official NAII Merchandise Package'
                          : 'Paket Merchandise Resmi NAII (Tier 1 & Tier 2)'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/75">
                        {en
                          ? 'Includes Exclusive "AI-Ready Diplomat" Sticker + Official NAII Merchandise (Totebag / Notebook / Lanyard / Pin) at the Booth Desk.'
                          : 'Berhak atas Stiker Eksklusif "AI-Ready Diplomat" + Paket Merchandise Resmi NAII (Totebag / Notebook / Lanyard / Pin) di meja panitia.'}
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
                          {en ? 'Confirm Handover' : 'Ya, Tandai Sudah Diserahkan'}
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
                        className="rounded-xl border border-[#C89D54]/50 bg-[#C89D54]/20 px-3.5 py-2 font-mono text-[11px] font-bold text-[#FFF4DE] transition hover:bg-[#C89D54]/35"
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
            /* PROGRESS BANNER WHEN < 3 STAMPS */
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200/90 bg-zinc-50/90 p-4 dark:border-white/10 dark:bg-black/40 sm:flex-row sm:items-center sm:p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#AD2B17]/30 bg-[#AD2B17]/10 text-[#AD2B17] dark:text-[#C89D54]">
                  {stampCount >= 1 ? <Award className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-zinc-900 dark:text-white sm:text-sm">
                    {stampCount >= 1
                      ? en
                        ? `Tier 1 Sticker Unlocked! Complete ${3 - stampCount} more stamp(s) for the Full Merchandise Ticket.`
                        : `Stiker Tier 1 Terbuka! Lengkapi ${3 - stampCount} stempel lagi untuk membuka Tiket Klaim Merchandise Resmi NAII.`
                      : en
                        ? 'Complete all 3 missions above to generate your Official Merchandise Claim Ticket!'
                        : 'Selesaikan ke-3 misi di atas untuk menerbitkan Tiket Klaim Merchandise Resmi NAII!'}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {en
                      ? 'Ticket Code will activate automatically once Stamp 01, Stamp 02, and Stamp 03 are stamped.'
                      : 'Kode Tiket Klaim akan aktif otomatis begitu Stempel 01, Stempel 02, dan Stempel 03 terkumpul.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 font-mono text-xs font-bold text-[#AD2B17] dark:text-[#C89D54]">
                {stampCount}/3 {en ? 'STAMPS' : 'STEMPEL'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
