import { NAII_STAR_PATH } from '../components/NaiiBrand'
import type { Player, SimulationResult } from '../types'

const W = 1080
const H = 1920
const FONT = '"Plus Jakarta Sans", Arial, Helvetica, sans-serif'

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/**
 * Menggambar "Diplomatic Persona Card" ukuran IG Story (1080×1920)
 * mengikuti NAII Brand Guidelines v1.0 (Dark Red #3A0900, NAII Red #AD2B17, White #FFFFFF, Plus Jakarta Sans).
 */
export async function drawPersonaCard(player: Player, r: SimulationResult): Promise<HTMLCanvasElement> {
  const logoWhite = await loadImage('/brand/naii-logo-white.png')
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const cx = W / 2

  // Latar resmi NAII Dark Red (#3A0900) -> Black (#000000)
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#3A0900')
  bg.addColorStop(0.6, '#220500')
  bg.addColorStop(1, '#000000')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Watermark NAII Star Mark di kanan bawah (seperti sampul Brand Guidelines)
  ctx.save()
  ctx.translate(640, 1280)
  ctx.scale(1.1, 1.1)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  const starPath = new Path2D(NAII_STAR_PATH)
  ctx.fill(starPath, 'evenodd')
  ctx.restore()

  // Header Logo Resmi NAII (All-white)
  if (logoWhite) {
    const lw = 420
    const lh = (lw * 580) / 1905
    ctx.drawImage(logoWhite, cx - lw / 2, 95, lw, lh)
  } else {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `800 44px ${FONT}`
    ctx.fillText('Nusantara AI Institute', cx, 150)
  }

  ctx.textAlign = 'center'
  roundRect(ctx, cx - 230, 248, 460, 52, 26)
  ctx.fillStyle = '#AD2B17'
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `italic 700 24px ${FONT}`
  ctx.fillText('DIPLOMATIC PERSONA · CIFP 2026', cx, 282)

  // Nama & Instansi Delegasi
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `800 58px ${FONT}`
  const nameLines = wrap(ctx, player.name, 900).slice(0, 2)
  const nameStartY = nameLines.length > 1 ? 360 : 385
  nameLines.forEach((l, i) => ctx.fillText(l, cx, nameStartY + i * 64))
  const instY = nameStartY + (nameLines.length - 1) * 64 + 62
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)'
  ctx.font = `500 32px ${FONT}`
  ctx.fillText(player.institution || 'Delegasi CIFP 2026', cx, instY)

  // Lingkaran Skor Diplomasi Bebas-Aktif
  ctx.beginPath()
  ctx.arc(cx, 720, 180, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fill()
  ctx.lineWidth = 20
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, 720, 180, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * r.score) / 100)
  ctx.strokeStyle = '#AD2B17'
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.fillStyle = '#FFFFFF'
  ctx.font = `800 144px ${FONT}`
  ctx.fillText(String(r.score), cx, 768)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.font = `700 26px ${FONT}`
  ctx.fillText('SKOR DIPLOMASI BEBAS-AKTIF', cx, 955)

  // Julukan Persona
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `800 66px ${FONT}`
  wrap(ctx, r.persona.title, 960).forEach((l, i) => ctx.fillText(l, cx, 1065 + i * 76))
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.font = `italic 500 34px ${FONT}`
  wrap(ctx, `“${r.persona.tagline}”`, 900).forEach((l, i) => ctx.fillText(l, cx, 1165 + i * 46))

  // Bar 3 Dimensi
  const dims: [string, number][] = [
    ['Kemandirian (Bebas)', r.dims.bebas],
    ['Kepemimpinan (Aktif)', r.dims.aktif],
    ['Literasi & Kedaulatan AI', r.dims.teknologi],
  ]
  ctx.textAlign = 'left'
  dims.forEach(([label, val], i) => {
    const y = 1320 + i * 92
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `600 30px ${FONT}`
    ctx.fillText(label, 120, y)
    ctx.textAlign = 'right'
    ctx.fillText(`${val}/100`, 960, y)
    ctx.textAlign = 'left'
    roundRect(ctx, 120, y + 18, 840, 22, 11)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)'
    ctx.fill()
    roundRect(ctx, 120, y + 18, (840 * val) / 100, 22, 11)
    ctx.fillStyle = '#AD2B17'
    ctx.fill()
  })

  // Skenario & Rekomendasi Kelas
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = `600 27px ${FONT}`
  ctx.fillText(`Skenario: ${r.scenario.title}`, cx, 1635)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `600 28px ${FONT}`
  const courseText = `Rekomendasi Kelas: ${r.persona.courses[0]}`
  ctx.fillText(courseText.length > 64 ? `${courseText.slice(0, 61)}...` : courseText, cx, 1685)

  // Footer CTA Pill (#AD2B17 dengan teks putih, rasio kontras 6.7:1 sesuai hal. 11 Brand Guidelines)
  roundRect(ctx, 140, 1745, 800, 98, 49)
  ctx.fillStyle = '#AD2B17'
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `800 36px ${FONT}`
  ctx.fillText('Belajar AI gratis di www.naii.co', cx, 1807)

  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal membuat gambar'))), 'image/png'),
  )
}

export async function downloadPersonaCard(player: Player, r: SimulationResult) {
  const canvas = await drawPersonaCard(player, r)
  const blob = await canvasToBlob(canvas)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `persona-diplomat-${player.name.replace(/\s+/g, '-').toLowerCase()}.png`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function sharePersonaCard(player: Player, r: SimulationResult): Promise<'shared' | 'downloaded'> {
  const canvas = await drawPersonaCard(player, r)
  const blob = await canvasToBlob(canvas)
  const file = new File([blob], 'persona-diplomat-naii-cifp2026.png', { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Diplomatic Persona Card — Nusantara AI Institute (NAII) × CIFP 2026',
        text: `Saya "${r.persona.title}" dengan skor ${r.score}! Coba juga di booth NAII @CIFP2026 dan belajar AI gratis di www.naii.co`,
      })
      return 'shared'
    } catch {
      /* dibatalkan pengguna → lanjut unduh */
    }
  }
  await downloadPersonaCard(player, r)
  return 'downloaded'
}
