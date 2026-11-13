export function TimerBar({
  remaining,
  total,
  label,
}: {
  remaining: number
  total: number
  label?: string
}) {
  const ratio = Math.max(0, Math.min(1, remaining / total))
  const seconds = Math.ceil(remaining / 1000)
  const isCritical = ratio <= 0.25

  return (
    <div className="space-y-1.5" role="region" aria-label="Diplomatic Countdown Timer">
      {label && (
        <div className="flex items-center justify-between font-mono text-[10px] tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold">{label}</span>
          <span className={isCritical ? 'font-bold text-[#AD2B17] dark:text-[#ff6b57] animate-pulse' : ''}>
            {isCritical ? '⚠️ CRITICAL INTERVAL' : 'COUNTDOWN ACTIVE'}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className="relative h-2.5 flex-1 overflow-hidden rounded-full border border-zinc-300/60 bg-zinc-200/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-black/50"
          role="progressbar"
          aria-valuenow={seconds}
          aria-valuemin={0}
          aria-valuemax={total / 1000}
        >
          {/* Subtle micro grid ticks at 25%, 50%, 75% marks */}
          <div className="pointer-events-none absolute inset-0 flex justify-between px-1.5 opacity-20 dark:opacity-30">
            <span className="h-full w-px bg-black dark:bg-white" />
            <span className="h-full w-px bg-black dark:bg-white" />
            <span className="h-full w-px bg-black dark:bg-white" />
          </div>

          <div
            className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
              ratio > 0.5
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                : ratio > 0.25
                  ? 'bg-gradient-to-r from-amber-600 via-[#C89D54] to-yellow-400 shadow-[0_0_10px_rgba(200,157,84,0.4)]'
                  : 'bg-gradient-to-r from-red-600 via-[#AD2B17] to-rose-500 shadow-[0_0_14px_rgba(173,43,23,0.7)] animate-pulse'
            }`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>

        <div
          className={`flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-0.5 font-mono text-xs font-extrabold tabular-nums transition-colors shadow-xs ${
            isCritical
              ? 'border-red-500/60 bg-red-500/10 text-[#AD2B17] dark:border-red-400/50 dark:bg-red-500/20 dark:text-[#ff7866] animate-pulse'
              : 'border-zinc-300/80 bg-zinc-100 text-zinc-900 dark:border-white/15 dark:bg-white/5 dark:text-white'
          }`}
        >
          {String(seconds).padStart(2, '0')}s
        </div>
      </div>
    </div>
  )
}
