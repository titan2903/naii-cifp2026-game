import type { QuizItem } from '../types'

export const FACT = 0
export const HALLUCINATION = 1
export const REAL_VS_AI_OPTIONS = ['FAKTA', 'HALUSINASI AI']

const item = (id: string, prompt: string, isFact: boolean, info: string): QuizItem => ({
  id,
  prompt,
  options: REAL_VS_AI_OPTIONS,
  answer: isFact ? FACT : HALLUCINATION,
  info,
})

/**
 * Pool pernyataan "Real Diplomacy or AI Hallucination?".
 * 5 pertama dari dokumen konsep, sisanya tambahan agar tiap ronde bervariasi.
 */
export const REAL_VS_AI_STATEMENTS: QuizItem[] = [
  item(
    'r1',
    'Pada KAA 1955 di Bandung, para delegasi menandatangani "Protokol Komputasi Asia-Afrika" untuk mengatur penggunaan mesin hitung otomatis.',
    false,
    'KAA 1955 menghasilkan Dasasila Bandung yang berfokus pada kedaulatan, perdamaian, dan anti-kolonialisme — bukan protokol komputasi.',
  ),
  item(
    'r2',
    'Majelis Umum PBB mengadopsi resolusi global pertama tentang AI pada Maret 2024 yang menekankan AI aman, terpercaya, dan mendukung pembangunan berkelanjutan.',
    true,
    'Resolusi ini diadopsi secara konsensus (tanpa voting) oleh seluruh anggota PBB — termasuk Indonesia — dengan lebih dari 120 negara ko-sponsor.',
  ),
  item(
    'r3',
    'Menurut hukum internasional terbaru, chatbot AI sah menandatangani perjanjian ekstradisi antarnegara tanpa persetujuan kepala negara atau diplomat.',
    false,
    'Penandatanganan traktat tetap menjadi kewenangan pejabat negara yang sah sesuai Konvensi Wina 1969 tentang Hukum Perjanjian.',
  ),
  item(
    'r4',
    'Indonesia memiliki UU Perlindungan Data Pribadi yang mengatur hak warga atas datanya, termasuk dalam pemrosesan otomatis.',
    true,
    'UU No. 27 Tahun 2022 tentang PDP menjadi tonggak penting kedaulatan data di Indonesia.',
  ),
  item(
    'r5',
    'Seluruh kursus AI di Nusantara AI Institute (www.naii.co) dapat diakses 100% gratis oleh masyarakat Indonesia.',
    true,
    'Semua modul pembelajaran di www.naii.co dapat diakses tanpa biaya berlangganan.',
  ),
  item(
    'r6',
    'Gerakan Non-Blok didirikan dalam KTT pertamanya di Jakarta pada tahun 1975.',
    false,
    'KTT pertama Gerakan Non-Blok digelar di Beograd (Yugoslavia) tahun 1961, dengan Soekarno sebagai salah satu tokoh pendirinya.',
  ),
  item(
    'r7',
    'ASEAN didirikan melalui Deklarasi Bangkok tahun 1967 oleh lima negara, termasuk Indonesia.',
    true,
    'Lima negara pendiri: Indonesia, Malaysia, Filipina, Singapura, dan Thailand — ditandatangani 8 Agustus 1967.',
  ),
  item(
    'r8',
    'Bung Hatta menyampaikan pidato "Mendayung di Antara Dua Karang" di Sidang Majelis Umum PBB di New York.',
    false,
    'Pidato itu disampaikan di depan Badan Pekerja KNIP di Yogyakarta pada 2 September 1948, sebelum Indonesia menjadi anggota PBB.',
  ),
  item(
    'r9',
    'Uni Eropa mengesahkan EU AI Act, regulasi AI komprehensif yang mengatur sistem AI berdasarkan tingkat risikonya.',
    true,
    'EU AI Act disahkan tahun 2024 dan mengklasifikasikan AI dari risiko minimal hingga risiko yang tidak dapat diterima.',
  ),
  item(
    'r10',
    'Indonesia menjadi Ketua ASEAN tahun 2023 dengan tema "ASEAN Matters: Epicentrum of Growth".',
    true,
    'Keketuaan Indonesia 2023 menekankan relevansi ASEAN dan perannya sebagai pusat pertumbuhan kawasan.',
  ),
  item(
    'r11',
    'Dewan Keamanan PBB memberikan kursi anggota tetap ke-6 kepada sebuah model AI untuk menengahi konflik secara netral.',
    false,
    'Anggota tetap DK PBB tetap lima negara (AS, Rusia, Tiongkok, Inggris, Prancis). AI tidak memiliki status hukum sebagai anggota.',
  ),
  item(
    'r12',
    'Dasasila Bandung yang dihasilkan KAA 1955 berisi sepuluh prinsip, antara lain menghormati kedaulatan dan integritas wilayah semua bangsa.',
    true,
    'Dasasila Bandung menjadi rujukan penting gerakan dekolonisasi dan solidaritas Asia-Afrika.',
  ),
]
