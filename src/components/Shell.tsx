import type { ReactNode } from 'react'
import {
  ArrowUpRight,
  Compass,
  Globe2,
  Languages,
  Moon,
  ShieldAlert,
  Stamp,
  Sun,
  Swords,
  Ticket,
  Trophy,
  UserRound,
  UserRoundX,
  Zap,
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { usePlayer } from '../context/PlayerContext'
import { useTheme } from '../context/ThemeContext'
import { ROUTE_PATHS, type Route } from '../hooks/useHashRoute'
import { backendMode } from '../lib/storage'
import { currentSessionTag, formatSessionTag } from '../lib/utils'
import { NaiiLogo, NaiiStarMark } from './NaiiBrand'
import { PassportModal } from './PassportModal'

const NAV_ITEMS: Array<{
  route: Route
  label: { id: string; en: string }
  mobileLabel: { id: string; en: string }
  href: string
  icon: typeof Compass
}> = [
  {
    route: 'home',
    label: { id: 'Paviliun', en: 'Pavilion' },
    mobileLabel: { id: 'Beranda', en: 'Home' },
    href: ROUTE_PATHS.home,
    icon: Compass,
  },
  {
    route: 'simulator',
    label: { id: 'Crisis Simulator', en: 'Crisis Simulator' },
    mobileLabel: { id: 'Simulator', en: 'Simulator' },
    href: ROUTE_PATHS.simulator,
    icon: Globe2,
  },
  {
    route: 'trivia',
    label: { id: 'Speed Trivia', en: 'Speed Trivia' },
    mobileLabel: { id: 'Trivia', en: 'Trivia' },
    href: ROUTE_PATHS.trivia,
    icon: Zap,
  },
  {
    route: 'realvsai',
    label: { id: 'Real vs AI', en: 'Real vs AI' },
    mobileLabel: { id: 'Real/AI', en: 'Real/AI' },
    href: ROUTE_PATHS.realvsai,
    icon: ShieldAlert,
  },
  {
    route: 'battle',
    label: { id: 'Prompt Battle', en: 'Prompt Battle' },
    mobileLabel: { id: 'Battle', en: 'Battle' },
    href: ROUTE_PATHS.battle,
    icon: Swords,
  },
  {
    route: 'leaderboard',
    label: { id: 'Leaderboard', en: 'Leaderboard' },
    mobileLabel: { id: 'Peringkat', en: 'Standings' },
    href: ROUTE_PATHS.leaderboard,
    icon: Trophy,
  },
]

export function Logo({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme()
  return (
    <a href={ROUTE_PATHS.home} className="group flex items-center gap-3 py-1">
      {/* Sesuai NAII Brand Guidelines hal. 6:
          - Reverse (Red mark + White wordmark) di latar gelap
          - Full-color (Red mark + Black wordmark) di latar terang */}
      <NaiiLogo variant={theme === 'dark' ? 'reverse' : 'full-color'} className="h-7 w-auto sm:h-9" />
      {!compact && (
        <div className="hidden items-center gap-3 border-l border-zinc-300 pl-3.5 dark:border-white/15 md:flex">
          <div className="leading-tight">
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-[#AD2B17]">
              CIFP 2026 · 10TH EDITION
            </p>
            <p className="text-[11px] font-medium tracking-tight text-zinc-600 dark:text-zinc-400">
              Indonesian Foreign Policy × AI
            </p>
          </div>
        </div>
      )}
    </a>
  )
}

export function Shell({ children, currentRoute = 'home' }: { children: ReactNode; currentRoute?: Route }) {
  const { player, clearPlayer, stampCount, setPassportOpen } = usePlayer()
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLang } = useLanguage()
  const en = lang === 'en'
  const sessionTag = formatSessionTag(currentSessionTag(), lang)

  return (
    <div className="relative flex min-h-[100dvh] flex-col pb-20 text-zinc-900 transition-colors duration-300 dark:text-zinc-100 lg:pb-0">
      {/* TOP DIPLOMATIC TELEMETRY STRIP */}
      <div className="border-b border-zinc-200/80 bg-zinc-900 text-zinc-300 dark:border-white/[0.07] dark:bg-[#070505]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3.5 py-1.5 font-mono text-[10px] sm:px-6 sm:text-[11px]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#AD2B17] animate-pulse-slow" />
            <span className="truncate font-semibold tracking-wider text-white">FPCI · CIFP 2026</span>
            <span className="hidden text-zinc-500 lg:inline">//</span>
            <span className="hidden truncate text-zinc-400 lg:inline">
              Independent &amp; Active Foreign Policy in the Next World Order
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
            <span className="text-zinc-400">
              {en ? 'SESSION' : 'SESI'} <strong className="text-white">{sessionTag}</strong>
            </span>
            <span className="hidden text-zinc-600 sm:inline">·</span>
            <a
              href="https://www.cifp.center/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1 text-zinc-300 transition hover:text-white sm:inline-flex"
            >
              cifp.center <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
            </a>
            <span className="text-zinc-600">·</span>
            <a
              href="https://www.naii.co"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 font-semibold text-[#e25a45] transition hover:text-white"
            >
              naii.co <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION HEADER */}
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-[#F6F4F0]/90 backdrop-blur-xl transition-colors dark:border-white/[0.08] dark:bg-[#0B0908]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3.5 py-2.5 sm:px-6 sm:py-3">
          <Logo />

          {/* DESKTOP SEGMENTED NAVIGATION */}
          <nav
            aria-label={en ? 'Desktop Main Navigation' : 'Navigasi Utama Desktop'}
            className="hidden items-center gap-1 rounded-2xl border border-zinc-200/90 bg-white/80 p-1 shadow-xs dark:border-white/[0.08] dark:bg-white/[0.03] lg:flex"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = currentRoute === item.route
              return (
                <a
                  key={item.route}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-tight transition ${
                    active
                      ? 'bg-[#AD2B17] text-white shadow-xs'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>{item.label[lang]}</span>
                </a>
              )
            })}
          </nav>

          {/* RIGHT ACTIONS: PASSPORT BADGE + DELEGATE BADGE + LANGUAGE SWITCH + THEME SWITCH */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPassportOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-xs font-bold transition active:scale-95 sm:px-3 sm:py-2 ${
                stampCount === 3
                  ? 'border-[#C89D54] bg-gradient-to-r from-[#AD2B17] to-[#3A0900] text-white shadow-[0_0_16px_rgba(200,157,84,0.4)]'
                  : 'border-[#AD2B17]/35 bg-[#AD2B17]/10 text-[#AD2B17] hover:bg-[#AD2B17]/20 dark:border-[#C89D54]/40 dark:bg-[#C89D54]/15 dark:text-[#C89D54]'
              }`}
              title={
                en
                  ? 'Open Diplomatic Mission Passport & Claim Merchandise Ticket'
                  : 'Buka Paspor Stempel 3 Misi & Tiket Klaim Merchandise'
              }
            >
              {stampCount === 3 ? (
                <Ticket className="h-3.5 w-3.5 shrink-0 text-[#C89D54]" strokeWidth={2} />
              ) : (
                <Stamp className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              )}
              <span className="hidden sm:inline">
                {stampCount === 3 ? (en ? 'Claim Ticket' : 'Tiket Klaim') : en ? 'Passport' : 'Paspor'}
              </span>
              <span className="rounded bg-black/15 px-1.5 py-0.2 text-[10px] dark:bg-white/15">
                {stampCount}/3
              </span>
            </button>

            {player && (
              <button
                onClick={clearPlayer}
                className="chip !px-2 !py-1.5 hover:border-[#AD2B17]/50 hover:text-zinc-950 dark:hover:text-white sm:!px-2.5"
                title={en ? 'Switch delegate / next player' : 'Ganti delegasi / pemain berikutnya'}
              >
                <UserRound className="h-3.5 w-3.5 shrink-0 text-[#AD2B17]" strokeWidth={1.75} />
                <span className="max-w-[4.5rem] truncate font-sans text-xs font-semibold normal-case tracking-normal sm:max-w-[9rem]">
                  {player.name}
                </span>
                <UserRoundX className="h-3.5 w-3.5 shrink-0 opacity-60" strokeWidth={1.75} />
              </button>
            )}

            {/* LANGUAGE TOGGLE BUTTON (ID / EN) */}
            <button
              onClick={toggleLang}
              className="btn-secondary !px-2.5 !py-2 font-mono text-xs text-zinc-700 dark:text-zinc-200 sm:!px-3"
              title={en ? 'Ganti ke Bahasa Indonesia (ID)' : 'Switch to English (EN)'}
              aria-label={en ? 'Switch language to Bahasa Indonesia' : 'Switch language to English'}
            >
              <Languages className="hidden h-4 w-4 text-[#AD2B17] sm:inline" strokeWidth={1.75} />
              <span className="inline-flex items-center gap-1">
                <span className={lang === 'id' ? 'font-extrabold text-[#AD2B17] dark:text-[#C89D54]' : 'opacity-60'}>
                  ID
                </span>
                <span className="opacity-40">/</span>
                <span className={lang === 'en' ? 'font-extrabold text-[#AD2B17] dark:text-[#C89D54]' : 'opacity-60'}>
                  EN
                </span>
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="btn-secondary !px-2.5 !py-2 text-xs text-zinc-700 dark:text-zinc-200 sm:!px-3"
              title={
                theme === 'dark'
                  ? en
                    ? 'Switch to Light Mode'
                    : 'Beralih ke Mode Terang (Light Mode)'
                  : en
                    ? 'Switch to Dark Mode'
                    : 'Beralih ke Mode Gelap (Dark Mode)'
              }
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-[#C89D54]" strokeWidth={1.75} />
                  <span className="hidden sm:inline">{en ? 'Light' : 'Terang'}</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#AD2B17]" strokeWidth={1.75} />
                  <span className="hidden sm:inline">{en ? 'Dark' : 'Gelap'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3.5 py-5 sm:px-6 sm:py-10">{children}</main>

      {/* ARCHITECTURAL DIPLOMATIC FOOTER */}
      <footer className="border-t border-zinc-200/80 bg-white/70 py-6 text-xs text-zinc-600 transition-colors dark:border-white/[0.08] dark:bg-[#070505]/90 dark:text-zinc-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3">
            <NaiiStarMark color="#AD2B17" className="h-5 w-5 shrink-0" />
            <p className="leading-relaxed">
              <strong className="font-bold text-zinc-900 dark:text-white">Nusantara AI Institute (NAII)</strong>{' '}
              Official Interactive Booth ·{' '}
              <a
                href="https://www.cifp.center/"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-zinc-400 underline-offset-4 hover:text-[#AD2B17]"
              >
                10th Conference on Indonesian Foreign Policy (CIFP 2026)
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[11px]">
            <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              {en ? 'TELEMETRY' : 'TELEMETRI'}: {backendMode === 'supabase' ? 'SUPABASE REALTIME' : 'BROWSER STORAGE'}
            </span>
            <a
              href="https://www.naii.co"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#AD2B17] hover:underline"
            >
              www.naii.co
            </a>
          </div>
        </div>
      </footer>

      {/* SMARTPHONE BOTTOM NAVIGATION BAR (Thumb-Friendly, Zero Confusion on Mobile) */}
      <nav
        aria-label={en ? 'Smartphone Navigation' : 'Navigasi Smartphone'}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/90 bg-white/95 px-1.5 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/[0.1] dark:bg-[#110B09]/95 lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = currentRoute === item.route
            return (
              <a
                key={item.route}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1 text-[10px] font-bold tracking-tight transition active:scale-95 ${
                  active
                    ? 'bg-[#AD2B17] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={active ? 2.2 : 1.75} />
                <span className="truncate">{item.mobileLabel[lang]}</span>
              </a>
            )
          })}
        </div>
      </nav>

      {/* PASPOR STEMPEL 3 MISI & TIKET KLAIM MERCHANDISE MODAL */}
      <PassportModal />
    </div>
  )
}
