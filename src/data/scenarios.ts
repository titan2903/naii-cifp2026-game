import type { Scenario } from '../types'

/**
 * 3 skenario "Bebas-Aktif AI Crisis Simulator".
 * dims = skor dasar tiap dimensi (0–100):
 *  - bebas     : kemandirian & tidak terseret blok
 *  - aktif     : kepemimpinan & inisiatif multilateral
 *  - teknologi : literasi/kedaulatan AI & data
 */
export const SCENARIOS: Scenario[] = [
  {
    id: 'ai-divide',
    code: 'SKENARIO 01',
    title: 'The Great AI Divide',
    subtitle: 'Perang Dingin Semikonduktor & Blokade AI',
    context:
      'Amerika Serikat dan Tiongkok memberlakukan pembatasan ekspor chip dan model AI tingkat lanjut. Negara Global South, termasuk anggota ASEAN, terancam tertinggal dan dipaksa memilih blok.',
    question:
      'Sebagai Ketua Delegasi RI yang menganut politik Bebas-Aktif, langkah strategis apa yang Anda ajukan di KTT Internasional untuk menjaga akses teknologi tanpa terseret aliansi blok?',
    options: [
      {
        id: 'A',
        text: 'Menggalang koalisi Global South & ASEAN untuk membangun infrastruktur Open-Source AI bersama yang netral.',
        dims: { bebas: 88, aktif: 86, teknologi: 80 },
        insight:
          'Langkah klasik "Bebas-Aktif": Indonesia tidak memilih blok, tetapi memimpin terbentuknya poros ketiga berbasis kolaborasi teknologi terbuka.',
        reactions: [
          { bloc: 'Blok Barat', stance: 'netral', text: 'Mencermati inisiatif ini, namun terbuka bila standar keamanan & transparansi dijaga.' },
          { bloc: 'Tiongkok & Mitra Timur', stance: 'netral', text: 'Menyambut sikap non-blok, menawarkan kontribusi riset tanpa syarat politik.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Antusias! India, Brasil, dan Afrika Selatan siap bergabung dalam konsorsium.' },
        ],
      },
      {
        id: 'B',
        text: 'Diplomasi ekonomi dua arah: membuka investasi pusat data dari kedua blok dengan syarat transfer ilmu bagi talenta lokal.',
        dims: { bebas: 82, aktif: 70, teknologi: 80 },
        insight:
          'Pragmatis dan menguntungkan secara ekonomi. Kuncinya ada pada negosiasi syarat transfer pengetahuan agar Indonesia tidak sekadar menjadi lokasi server.',
        reactions: [
          { bloc: 'Blok Barat', stance: 'positif', text: 'Raksasa teknologi AS siap berinvestasi, tetapi meminta jaminan perlindungan IP.' },
          { bloc: 'Tiongkok & Mitra Timur', stance: 'positif', text: 'Siap membangun pusat data dan program beasiswa talenta digital.' },
          { bloc: 'Global South & ASEAN', stance: 'netral', text: 'Menilai Indonesia cerdik, namun khawatir persaingan investasi antarnegara ASEAN.' },
        ],
      },
      {
        id: 'C',
        text: 'Mempelopori traktat PBB tentang akses teknologi AI yang setara sebagai hak pembangunan global.',
        dims: { bebas: 72, aktif: 78, teknologi: 48 },
        insight:
          'Visioner dan berprinsip, tetapi proses traktat PBB memakan waktu bertahun-tahun. Perlu langkah teknis jangka pendek agar talenta lokal tidak tertinggal.',
        reactions: [
          { bloc: 'Blok Barat', stance: 'waspada', text: 'Khawatir traktat membatasi kontrol ekspor demi keamanan nasional mereka.' },
          { bloc: 'Tiongkok & Mitra Timur', stance: 'netral', text: 'Mendukung prinsipnya, namun hati-hati soal mekanisme pengawasan.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Mendukung penuh sebagai perjuangan keadilan pembangunan.' },
        ],
      },
    ],
  },
  {
    id: 'data-sovereignty',
    code: 'SKENARIO 02',
    title: 'Sovereign Data vs Global Tech Giants',
    subtitle: 'Kedaulatan Data & Tata Kelola AI ASEAN',
    context:
      'Perusahaan teknologi multinasional melatih model AI dengan jutaan data publik dan budaya masyarakat Asia Tenggara tanpa kompensasi, berisiko melanggar privasi warga.',
    question:
      'Bagaimana posisi diplomasi Indonesia untuk menyeimbangkan keterbukaan inovasi global dengan perlindungan kedaulatan data nasional (UU PDP)?',
    options: [
      {
        id: 'A',
        text: 'Mendorong kerangka "ASEAN AI Governance & Data Sovereignty" yang mewajibkan kepatuhan pada hukum lokal seperti UU PDP.',
        dims: { bebas: 84, aktif: 88, teknologi: 76 },
        insight:
          'Memanfaatkan sentralitas ASEAN sebagai daya tawar kolektif — 680 juta penduduk jauh lebih didengar daripada negosiasi bilateral.',
        reactions: [
          { bloc: 'Blok Barat', stance: 'netral', text: 'Menghormati, membandingkannya dengan pendekatan GDPR Uni Eropa.' },
          { bloc: 'Tiongkok & Mitra Timur', stance: 'netral', text: 'Mendukung prinsip kedaulatan data, sejalan dengan kebijakan domestik mereka.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Sebagian besar anggota ASEAN mendukung; beberapa meminta masa transisi.' },
        ],
      },
      {
        id: 'B',
        text: 'Memberi insentif bagi perusahaan AI global yang bermitra dengan institusi pendidikan lokal untuk melatih talenta dalam negeri.',
        dims: { bebas: 72, aktif: 70, teknologi: 84 },
        insight:
          'Pendekatan "carrot" yang membangun SDM. Namun tanpa kerangka hukum regional, perlindungan data warga masih rentan.',
        reactions: [
          { bloc: 'Blok Barat', stance: 'positif', text: 'Perusahaan teknologi menyambut baik dan siap membuka program akademi AI.' },
          { bloc: 'Tiongkok & Mitra Timur', stance: 'positif', text: 'Menawarkan kemitraan kampus dan laboratorium riset bersama.' },
          { bloc: 'Global South & ASEAN', stance: 'netral', text: 'Mengapresiasi, tetapi menunggu bukti dampak nyata bagi privasi warga.' },
        ],
      },
      {
        id: 'C',
        text: 'Membangun standar etika AI Nusantara yang melindungi kekayaan intelektual, bahasa daerah, dan privasi warga.',
        dims: { bebas: 82, aktif: 56, teknologi: 70 },
        insight:
          'Kuat dalam menjaga identitas dan kedaulatan budaya digital, namun cenderung inward-looking. Perlu diangkat ke forum regional agar berdampak global.',
        reactions: [
          { bloc: 'Blok Barat', stance: 'waspada', text: 'Khawatir standar nasional yang unik menambah beban kepatuhan bisnis.' },
          { bloc: 'Tiongkok & Mitra Timur', stance: 'netral', text: 'Menghormati sebagai urusan domestik Indonesia.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Negara dengan keragaman bahasa tertarik mengadopsi model serupa.' },
        ],
      },
    ],
  },
  {
    id: 'deepfake-crisis',
    code: 'SKENARIO 03',
    title: 'Hybrid Information Warfare',
    subtitle: 'Krisis Disinformasi Deepfake di Indo-Pasifik',
    context:
      'Video deepfake ultra-realistis yang menampilkan pemimpin negara tetangga mengumumkan provokasi militer viral, memicu kepanikan pasar dan ketegangan di Asia Tenggara.',
    question:
      'Apa langkah diplomasi krisis Indonesia dalam 24 jam pertama agar kawasan tetap stabil dan bergerak ke arah yang benar?',
    options: [
      {
        id: 'A',
        text: 'Mengaktifkan hotline diplomatik ASEAN dan membentuk Satgas Verifikasi Forensik AI lintas negara.',
        dims: { bebas: 80, aktif: 90, teknologi: 88 },
        insight:
          'Respons cepat, kolektif, dan berbasis teknologi. Verifikasi forensik meruntuhkan narasi palsu sebelum eskalasi terjadi.',
        reactions: [
          { bloc: 'Blok Barat', stance: 'positif', text: 'Menawarkan dukungan alat deteksi deepfake dan intelijen siber.' },
          { bloc: 'Tiongkok & Mitra Timur', stance: 'positif', text: 'Mendukung penyelesaian di dalam kerangka ASEAN tanpa intervensi luar.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Negara tetangga lega — pernyataan bersama terbit dalam 6 jam.' },
        ],
      },
      {
        id: 'B',
        text: 'Mengeluarkan pernyataan bersama untuk menahan diri (de-eskalasi) sembari mengedukasi publik tentang literasi deteksi manipulasi AI.',
        dims: { bebas: 78, aktif: 70, teknologi: 70 },
        insight:
          'Menenangkan situasi dan membangun ketahanan publik jangka panjang, tetapi tanpa verifikasi teknis, rumor bisa terus beredar.',
        reactions: [
          { bloc: 'Blok Barat', stance: 'netral', text: 'Mendukung de-eskalasi, menunggu klarifikasi resmi.' },
          { bloc: 'Tiongkok & Mitra Timur', stance: 'netral', text: 'Menyerukan semua pihak menahan diri.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Mengapresiasi kepemimpinan Indonesia yang menenangkan.' },
        ],
      },
      {
        id: 'C',
        text: 'Mengusulkan protokol keamanan siber dan pelabelan konten AI (watermarking) dalam kerja sama pertahanan kawasan.',
        dims: { bebas: 74, aktif: 72, teknologi: 86 },
        insight:
          'Solusi struktural yang mencegah krisis serupa di masa depan, namun kurang menjawab kebutuhan respons dalam 24 jam pertama.',
        reactions: [
          { bloc: 'Blok Barat', stance: 'positif', text: 'Mendukung standar watermarking, sejalan dengan inisiatif industri mereka.' },
          { bloc: 'Tiongkok & Mitra Timur', stance: 'netral', text: 'Setuju prinsipnya, ingin standar tidak didominasi satu pihak.' },
          { bloc: 'Global South & ASEAN', stance: 'netral', text: 'Butuh dukungan kapasitas teknis agar bisa menerapkannya.' },
        ],
      },
    ],
  },
]
