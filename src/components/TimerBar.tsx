export function TimerBar({ remaining, total }: { remaining: number; total: number }) {
  const ratio = Math.max(0, Math.min(1, remaining / total))
  const seconds = Math.ceil(remaining / 1000)
  const color = ratio > 0.5 ? 'bg-emerald-500' : ratio > 0.25 ? 'bg-[#C89D54]' : 'bg-[#AD2B17]'

  return (
    <div className="flex items-center gap-3.5">
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10"
        role="progressbar"
        aria-valuenow={seconds}
        aria-valuemin={0}
        aria-valuemax={total / 1000}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${color}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span
        className={`w-12 text-right font-mono text-base font-extrabold tabular-nums ${
          ratio <= 0.25 ? 'text-[#AD2B17] dark:text-[#e25a45]' : 'text-zinc-900 dark:text-white'
        }`}
      >
        {String(seconds).padStart(2, '0')}s
      </span>
    </div>
  )
}
