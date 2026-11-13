import { useEffect, useRef } from 'react'

const EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const

/**
 * Mode kiosk: bila tidak ada interaksi selama `timeoutMs`, panggil onIdle
 * (kembali ke beranda & reset pemain) agar pengunjung berikutnya mulai dari awal.
 */
export function useIdleReset(enabled: boolean, timeoutMs: number, onIdle: () => void) {
  const cbRef = useRef(onIdle)

  useEffect(() => {
    cbRef.current = onIdle
  }, [onIdle])

  useEffect(() => {
    if (!enabled) return
    let timer = window.setTimeout(() => cbRef.current(), timeoutMs)
    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => cbRef.current(), timeoutMs)
    }
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      window.clearTimeout(timer)
      EVENTS.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [enabled, timeoutMs])
}
