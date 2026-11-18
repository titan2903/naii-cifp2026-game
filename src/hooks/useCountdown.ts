import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Countdown per-soal. Waktu dihitung dari performance.now() (bukan akumulasi tick),
 * sehingga bonus kecepatan akurat meski interval UI hanya 100 ms.
 */
export function useCountdown(durationMs: number, active: boolean, resetKey: unknown, onExpire: () => void) {
  const [state, setState] = useState<{ key: unknown; remaining: number }>({
    key: resetKey,
    remaining: durationMs,
  })
  const startRef = useRef(0)
  const expireRef = useRef(onExpire)

  useEffect(() => {
    expireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!active) return
    startRef.current = performance.now()
    const id = window.setInterval(() => {
      const left = Math.max(0, durationMs - (performance.now() - startRef.current))
      setState({ key: resetKey, remaining: left })
      if (left <= 0) {
        window.clearInterval(id)
        expireRef.current()
      }
    }, 80)
    return () => {
      window.clearInterval(id)
      startRef.current = 0
    }
  }, [active, durationMs, resetKey])

  const getElapsedMs = useCallback(() => {
    if (startRef.current <= 0) return durationMs
    return Math.max(0, Math.min(durationMs, performance.now() - startRef.current))
  }, [durationMs])
  const remaining = state.key === resetKey ? state.remaining : durationMs

  return { remaining, getElapsedMs }
}
