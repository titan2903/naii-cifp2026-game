import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { usePlayer } from '../context/PlayerContext'
import { NaiiStarMark } from './NaiiBrand'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type ErrorKey = 'name' | 'email' | 'consent' | null

function PlayerForm({ title, subtitle }: { title: string; subtitle: string }) {
  const { setPlayer } = usePlayer()
  const { lang } = useLanguage()
  const en = lang === 'en'

  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [errorKey, setErrorKey] = useState<ErrorKey>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (n.length < 2) {
      return setErrorKey('name')
    }
    if (email && !EMAIL_RE.test(email.trim())) {
      return setErrorKey('email')
    }
    if (email && !consent) {
      return setErrorKey('consent')
    }
    setPlayer({
      name: n.slice(0, 40),
      institution: institution.trim().slice(0, 60),
      email: email.trim(),
      consent,
    })
  }

  return (
    <div className="mx-auto max-w-lg animate-rise">
      <form onSubmit={submit} className="glass space-y-5 p-6 sm:p-9">
        <div className="space-y-2 border-b border-zinc-200 pb-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="chip !border-[#AD2B17]/30 !bg-[#AD2B17]/10 !text-[#AD2B17] dark:!text-white">
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              {en ? 'CIFP 2026 DELEGATE ACCREDITATION' : 'AKREDITASI DELEGASI CIFP 2026'}
            </span>
            <NaiiStarMark color="#AD2B17" className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{title}</h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="delegate-name" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {en ? 'Full Name / Delegate Callsign *' : 'Nama Lengkap / Panggilan Delegasi *'}
          </label>
          <input
            id="delegate-name"
            className="field"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errorKey) setErrorKey(null)
            }}
            placeholder={en ? 'e.g., Mahendra Kusuma' : 'Contoh: Mahendra Kusuma'}
            maxLength={40}
            autoFocus
          />
          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {en
              ? 'Displayed on your Persona Card & break-session leaderboard.'
              : 'Ditampilkan pada Kartu Persona & papan peringkat sesi break.'}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="delegate-inst" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {en ? 'University / Ministry / Institution Affiliation' : 'Afiliasi Kampus / Kementerian / Instansi'}
          </label>
          <input
            id="delegate-inst"
            className="field"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder={
              en
                ? 'e.g., International Relations UGM / Ministry of Foreign Affairs'
                : 'Contoh: HI Universitas Gadjah Mada / Kemlu RI'
            }
            maxLength={60}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="delegate-email" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {en ? 'Email (Optional — Free Course Access at www.naii.co)' : 'Email (Opsional — Akses Modul Gratis www.naii.co)'}
          </label>
          <input
            id="delegate-email"
            className="field"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errorKey) setErrorKey(null)
            }}
            placeholder={en ? 'delegate@university.ac.id' : 'delegasi@instansi.ac.id'}
          />
        </div>

        {email && (
          <label className="flex items-start gap-3 rounded-xl border border-zinc-300 bg-zinc-50 p-3.5 text-xs leading-relaxed text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked)
                if (errorKey) setErrorKey(null)
              }}
              className="mt-0.5 h-4 w-4 accent-[#AD2B17]"
            />
            <span>
              {en
                ? 'I consent to Nusantara AI Institute (NAII) storing my email to send free AI course access, in compliance with Indonesia’s Personal Data Protection Law (Law No. 27/2022 · UU PDP). Your email remains strictly private and is never shown on public screens.'
                : 'Saya menyetujui penyimpanan email oleh Nusantara AI Institute (NAII) untuk pengiriman akses kursus AI gratis, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Email bersifat privat dan tidak pernah ditampilkan di layar publik.'}
            </span>
          </label>
        )}

        {errorKey && (
          <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {errorKey === 'name'
              ? en
                ? 'Delegate name must be at least 2 characters.'
                : 'Nama delegasi minimal 2 karakter.'
              : errorKey === 'email'
                ? en
                  ? 'Please enter a valid email address.'
                  : 'Format alamat email belum valid.'
                : en
                  ? 'Please check the Personal Data Protection (UU PDP) consent box to save your email.'
                  : 'Mohon centang persetujuan pelindungan data (UU PDP) untuk menyimpan email.'}
          </p>
        )}

        <button type="submit" className="btn-primary w-full !py-3.5 text-base">
          {en ? 'Enter Simulation Session' : 'Buka Sesi Simulasi'}{' '}
          <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-[#AD2B17]" strokeWidth={1.75} />
          {en
            ? 'Only your Name & Institution appear on public displays.'
            : 'Hanya Nama & Instansi yang tampil pada layar publik.'}
        </p>
      </form>
    </div>
  )
}

/** Membungkus game: tampilkan form registrasi bila pemain belum terdaftar. */
export function RequirePlayer({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const { player } = usePlayer()
  return player ? <>{children}</> : <PlayerForm title={title} subtitle={subtitle} />
}
