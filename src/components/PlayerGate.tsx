import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { NaiiStarMark } from './NaiiBrand'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function PlayerForm({ title, subtitle }: { title: string; subtitle: string }) {
  const { setPlayer } = usePlayer()
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (n.length < 2) return setError('Nama delegasi minimal 2 karakter.')
    if (email && !EMAIL_RE.test(email.trim())) return setError('Format alamat email belum valid.')
    if (email && !consent) return setError('Mohon centang persetujuan pelindungan data (UU PDP) untuk menyimpan email.')
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
              AKREDITASI DELEGASI CIFP 2026
            </span>
            <NaiiStarMark color="#AD2B17" className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{title}</h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="delegate-name" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Nama Lengkap / Panggilan Delegasi *
          </label>
          <input
            id="delegate-name"
            className="field"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            placeholder="Contoh: Mahendra Kusuma"
            maxLength={40}
            autoFocus
          />
          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            Ditampilkan pada Kartu Persona &amp; papan peringkat sesi break.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="delegate-inst" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Afiliasi Kampus / Kementerian / Instansi
          </label>
          <input
            id="delegate-inst"
            className="field"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Contoh: HI Universitas Gadjah Mada / Kemlu RI"
            maxLength={60}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="delegate-email" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Email (Opsional — Akses Modul Gratis www.naii.co)
          </label>
          <input
            id="delegate-email"
            className="field"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            placeholder="delegasi@instansi.ac.id"
          />
        </div>

        {email && (
          <label className="flex items-start gap-3 rounded-xl border border-zinc-300 bg-zinc-50 p-3.5 text-xs leading-relaxed text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked)
                if (error) setError('')
              }}
              className="mt-0.5 h-4 w-4 accent-[#AD2B17]"
            />
            <span>
              Saya menyetujui penyimpanan email oleh Nusantara AI Institute (NAII) untuk pengiriman akses kursus AI
              gratis, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Email bersifat privat dan
              tidak pernah ditampilkan di layar publik.
            </span>
          </label>
        )}

        {error && (
          <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full !py-3.5 text-base">
          Buka Sesi Simulasi <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-[#AD2B17]" strokeWidth={1.75} />
          Hanya Nama &amp; Instansi yang tampil pada layar publik.
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
