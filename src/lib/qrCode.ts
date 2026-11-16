/**
 * Generator Matriks QR Code Standar ISO/IEC 18004 (Murni TypeScript, Tanpa Dependency Eksternal).
 * Mendukung Byte Mode (UTF-8), Error Correction Level M (~15% pemulihan), Versi 1–6 (hingga 106 byte).
 * Digunakan untuk merender SVG QR Code tajam 100% offline di layar TV/Tablet/Smartphone Booth.
 */

interface VersionSpec {
  version: number
  size: number
  totalData: number
  ecPerBlock: number
  blocks: number
  align: number[]
}

const VERSIONS_M: readonly VersionSpec[] = [
  { version: 1, size: 21, totalData: 16, ecPerBlock: 10, blocks: 1, align: [] },
  { version: 2, size: 25, totalData: 28, ecPerBlock: 16, blocks: 1, align: [6, 18] },
  { version: 3, size: 29, totalData: 44, ecPerBlock: 26, blocks: 1, align: [6, 22] },
  { version: 4, size: 33, totalData: 64, ecPerBlock: 18, blocks: 2, align: [6, 26] },
  { version: 5, size: 37, totalData: 86, ecPerBlock: 24, blocks: 2, align: [6, 30] },
  { version: 6, size: 41, totalData: 108, ecPerBlock: 16, blocks: 4, align: [6, 34] },
]

// Tabel Galois Field GF(256) dengan polinomial primitif 0x11D
const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)
;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255]
  }
})()

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return GF_EXP[GF_LOG[a] + GF_LOG[b]]
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1])
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1)
    const root = GF_EXP[i]
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]
      next[j + 1] ^= gfMul(poly[j], root)
    }
    poly = next
  }
  return poly
}

function rsEncode(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLen)
  const rem = new Uint8Array(ecLen)
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ rem[0]
    rem.copyWithin(0, 1)
    rem[ecLen - 1] = 0
    if (factor !== 0) {
      for (let j = 0; j < ecLen; j++) {
        rem[j] ^= gfMul(gen[j + 1], factor)
      }
    }
  }
  return rem
}

function encodeCodewords(text: string): { spec: VersionSpec; codewords: Uint8Array } {
  const bytes = new TextEncoder().encode(text)
  const spec = VERSIONS_M.find((v) => bytes.length + 2 <= v.totalData)
  if (!spec) {
    throw new Error(`Teks QR terlalu panjang (${bytes.length} byte)`)
  }

  const bits: number[] = []
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1)
    }
  }

  // Byte mode indicator (0100) + 8-bit length
  pushBits(0b0100, 4)
  pushBits(bytes.length, 8)
  for (const b of bytes) pushBits(b, 8)

  // Terminator (hingga 4 bit 0)
  const maxBits = spec.totalData * 8
  const term = Math.min(4, maxBits - bits.length)
  pushBits(0, term)

  while (bits.length % 8 !== 0) bits.push(0)

  const dataBytes = new Uint8Array(spec.totalData)
  for (let i = 0; i < bits.length / 8; i++) {
    let b = 0
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j]
    dataBytes[i] = b
  }

  let padIdx = bits.length / 8
  let padToggle = true
  while (padIdx < spec.totalData) {
    dataBytes[padIdx++] = padToggle ? 0xec : 0x11
    padToggle = !padToggle
  }

  // Bagi ke blok Reed-Solomon dan interleave
  const blockDataLen = spec.totalData / spec.blocks
  const dataBlocks: Uint8Array[] = []
  const ecBlocks: Uint8Array[] = []

  for (let b = 0; b < spec.blocks; b++) {
    const slice = dataBytes.subarray(b * blockDataLen, (b + 1) * blockDataLen)
    dataBlocks.push(slice)
    ecBlocks.push(rsEncode(slice, spec.ecPerBlock))
  }

  const out: number[] = []
  for (let i = 0; i < blockDataLen; i++) {
    for (let b = 0; b < spec.blocks; b++) out.push(dataBlocks[b][i])
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) out.push(ecBlocks[b][i])
  }

  return { spec, codewords: new Uint8Array(out) }
}

function computeFormatBits(mask: number): number {
  // ECC Level M memiliki bit indikator 00
  const data5 = (0b00 << 3) | mask
  let d = data5 << 10
  for (let i = 14; i >= 10; i--) {
    if ((d >> i) & 1) d ^= 0x537 << (i - 10)
  }
  return ((data5 << 10) | d) ^ 0x5412
}

/**
 * Menghasilkan matriks boolean 2D (`true` = modul gelap/hitam, `false` = terang/putih)
 * untuk string URL/teks yang diberikan.
 */
export function generateQrMatrix(text: string): boolean[][] {
  const { spec, codewords } = encodeCodewords(text)
  const n = spec.size
  const modules: boolean[][] = Array.from({ length: n }, () => Array<boolean>(n).fill(false))
  const isFunc: boolean[][] = Array.from({ length: n }, () => Array<boolean>(n).fill(false))

  const setFunctionModule = (r: number, c: number, dark: boolean) => {
    if (r < 0 || r >= n || c < 0 || c >= n) return
    modules[r][c] = dark
    isFunc[r][c] = true
  }

  // 1. Finder patterns (7x7) + separators (1px putih)
  const placeFinder = (top: number, left: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const inside = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6
        const ring = dr === 0 || dr === 6 || dc === 0 || dc === 6
        const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
        setFunctionModule(top + dr, left + dc, inside && (ring || core))
      }
    }
  }
  placeFinder(0, 0)
  placeFinder(0, n - 7)
  placeFinder(n - 7, 0)

  // 2. Timing patterns (baris 6 & kolom 6)
  for (let i = 8; i < n - 8; i++) {
    setFunctionModule(6, i, i % 2 === 0)
    setFunctionModule(i, 6, i % 2 === 0)
  }

  // 3. Alignment patterns (5x5)
  for (const ar of spec.align) {
    for (const ac of spec.align) {
      if ((ar === 6 && ac === 6) || (ar === 6 && ac === n - 7) || (ar === n - 7 && ac === 6)) {
        continue
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1
          setFunctionModule(ar + dr, ac + dc, dark)
        }
      }
    }
  }

  // 4. Dark module & reservasi area Format Info
  setFunctionModule(n - 8, 8, true)
  for (let i = 0; i < 9; i++) {
    if (!isFunc[8][i]) setFunctionModule(8, i, false)
    if (!isFunc[i][8]) setFunctionModule(i, 8, false)
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunc[8][n - 1 - i]) setFunctionModule(8, n - 1 - i, false)
    if (!isFunc[n - 1 - i][8]) setFunctionModule(n - 1 - i, 8, false)
  }

  // 5. Tempatkan bit data secara zig-zag 2 kolom dari kanan-bawah ke kiri
  let bitIdx = 0
  const totalBits = codewords.length * 8
  let upward = true

  for (let right = n - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5 // Lewati kolom timing vertikal
    for (let v = 0; v < n; v++) {
      const r = upward ? n - 1 - v : v
      for (let j = 0; j < 2; j++) {
        const c = right - j
        if (!isFunc[r][c]) {
          let dark = false
          if (bitIdx < totalBits) {
            dark = ((codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1) === 1
            bitIdx++
          }
          modules[r][c] = dark
        }
      }
    }
    upward = !upward
  }

  // 6. Terapkan Mask 0 ((r + c) % 2 === 0) dan tulis Format Information
  const mask = 0
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!isFunc[r][c] && (r + c) % 2 === 0) {
        modules[r][c] = !modules[r][c]
      }
    }
  }

  const fmt = computeFormatBits(mask)
  const bit = (i: number) => ((fmt >> i) & 1) === 1

  // Top-left format info (MSB bit 14 -> LSB bit 0)
  const tlCoords: [number, number][] = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ]
  for (let i = 0; i < 15; i++) {
    const [r, c] = tlCoords[i]
    modules[r][c] = bit(14 - i)
  }

  // Bottom-left (bits 14..8) & Top-right (bits 7..0)
  for (let i = 0; i < 7; i++) {
    modules[n - 1 - i][8] = bit(14 - i)
  }
  for (let i = 0; i < 8; i++) {
    modules[8][n - 8 + i] = bit(7 - i)
  }

  return modules
}
