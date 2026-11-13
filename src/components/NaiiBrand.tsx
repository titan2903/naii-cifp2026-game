/**
 * Komponen Identitas Resmi Nusantara AI Institute (NAII)
 * Mengikuti NAII Brand Guidelines v1.0 (November 2026):
 * - NAII Red: #AD2B17 | Dark Red: #3A0900 | Black: #000000 | White: #FFFFFF
 * - Wordmark tidak diketik ulang; menggunakan file logo resmi yang diekstrak dari PDF.
 * - Star Mark digunakan untuk ikon, pin, stiker, dan watermark latar.
 */

export const NAII_STAR_PATH =
  'M230 10 H350 L433 122 L570 226 V354 L433 458 L350 570 H230 L147 458 L10 354 V226 L147 122 Z M275 74 A15 15 0 0 1 305 74 V128 L366 214 L452 275 H506 A15 15 0 0 1 506 305 H452 L366 366 L305 452 V506 A15 15 0 0 1 275 506 V452 L214 366 L128 305 H74 A15 15 0 0 1 74 275 H128 L214 214 L275 128 Z'

export function NaiiStarMark({
  color = '#AD2B17',
  className = 'h-8 w-8',
}: {
  color?: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 580 580" fill="none" aria-hidden className={className}>
      <path fill={color} fillRule="evenodd" clipRule="evenodd" d={NAII_STAR_PATH} />
    </svg>
  )
}

export function NaiiLogo({
  variant = 'reverse',
  className = 'h-9 w-auto',
}: {
  /**
   * - 'reverse': Red mark + White wordmark (untuk latar hitam / gelap netral)
   * - 'white': All-white mark + wordmark (untuk latar NAII Red #AD2B17 atau Dark Red #3A0900)
   * - 'full-color': Red mark + Black wordmark (untuk latar putih / terang)
   */
  variant?: 'reverse' | 'white' | 'full-color'
  className?: string
}) {
  const src =
    variant === 'white'
      ? '/brand/naii-logo-white.png'
      : variant === 'full-color'
        ? '/brand/naii-logo-full-color.png'
        : '/brand/naii-logo-reverse.png'

  return (
    <img
      src={src}
      alt="Nusantara AI Institute"
      width={1905}
      height={580}
      className={`select-none object-contain ${className}`}
    />
  )
}

/** Watermark Star Mark khas slide sampul & pembatas bab NAII Brand Guidelines. */
export function NaiiWatermark({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none select-none ${className}`}>
      <NaiiStarMark color="#FFFFFF" className="h-full w-full opacity-[0.07]" />
    </div>
  )
}
