import type { Lang } from '../context/LanguageContext'
import type { QuizItem } from '../types'

export const FACT = 0
export const HALLUCINATION = 1
export const REAL_VS_AI_OPTIONS = ['FAKTA', 'HALUSINASI AI']
export const REAL_VS_AI_OPTIONS_EN = ['DIPLOMATIC FACT', 'AI HALLUCINATION']

const item = (id: string, prompt: string, isFact: boolean, info: string, options = REAL_VS_AI_OPTIONS): QuizItem => ({
  id,
  prompt,
  options,
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

export const REAL_VS_AI_STATEMENTS_EN: QuizItem[] = [
  item(
    'r1',
    'At the 1955 Asian-African Conference in Bandung, delegates signed the "Asian-African Computing Protocol" to regulate automated calculating machines.',
    false,
    'The 1955 Bandung Conference produced the Ten Principles of Bandung (Dasasila Bandung) on sovereignty, peace, and decolonization — never a computing protocol.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r2',
    'The UN General Assembly adopted its first landmark global resolution on AI in March 2024, championing safe, secure, and trustworthy AI for sustainable development.',
    true,
    'The resolution was adopted by consensus (without a vote) by all UN Member States — including Indonesia — with over 120 co-sponsors.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r3',
    'Under updated international law, an autonomous AI chatbot can legally sign bilateral extradition treaties without approval from a head of state or plenipotentiary diplomat.',
    false,
    'Treaty-signing authority remains strictly vested in accredited state representatives under the 1969 Vienna Convention on the Law of Treaties.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r4',
    'Indonesia enacted a comprehensive Personal Data Protection Law (UU PDP) regulating citizens’ rights over their personal data, including automated processing.',
    true,
    'Law No. 27 of 2022 on Personal Data Protection (UU PDP) is a cornerstone of Indonesia’s digital and data sovereignty.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r5',
    'All AI courses at Nusantara AI Institute (www.naii.co) are 100% free of charge for learners across Indonesia.',
    true,
    'Every learning module on www.naii.co is accessible completely free without subscription paywalls.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r6',
    'The Non-Aligned Movement (NAM) was founded at its inaugural summit in Jakarta in 1975.',
    false,
    'The first Non-Aligned Movement Summit took place in Belgrade (Yugoslavia) in 1961, with President Soekarno among its founding leaders.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r7',
    'ASEAN was established through the 1967 Bangkok Declaration signed by five founding nations, including Indonesia.',
    true,
    'The five founding members — Indonesia, Malaysia, the Philippines, Singapore, and Thailand — signed the Bangkok Declaration on August 8, 1967.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r8',
    'Mohammad Hatta delivered his historic "Mendayung di Antara Dua Karang" (Rowing Between Two Reefs) address before the UN General Assembly in New York.',
    false,
    'Hatta delivered the speech before the KNIP Working Committee in Yogyakarta on September 2, 1948, prior to Indonesia’s admission to the UN.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r9',
    'The European Union enacted the EU AI Act, a comprehensive legal framework regulating AI systems according to their risk tiers.',
    true,
    'Enacted in 2024, the EU AI Act classifies AI applications from minimal risk up to unacceptable risk.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r10',
    'Indonesia chaired ASEAN in 2023 under the official theme "ASEAN Matters: Epicentrum of Growth".',
    true,
    'Indonesia’s 2023 Chairmanship underscored ASEAN centrality and the region’s role as an engine of global economic growth.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r11',
    'The UN Security Council granted a 6th permanent seat (P6) to an autonomous AI model to mediate international conflicts neutrally.',
    false,
    'The UN Security Council retains five permanent members (US, Russia, China, UK, France). AI systems hold no legal personhood or UN membership.',
    REAL_VS_AI_OPTIONS_EN,
  ),
  item(
    'r12',
    'The Ten Principles of Bandung (Dasasila Bandung) from the 1955 Asian-African Conference include mutual respect for the sovereignty and territorial integrity of all nations.',
    true,
    'Dasasila Bandung became a foundational charter for global decolonization and Asian-African solidarity.',
    REAL_VS_AI_OPTIONS_EN,
  ),
]

export function getRealVsAiStatements(lang: Lang = 'id'): QuizItem[] {
  return lang === 'en' ? REAL_VS_AI_STATEMENTS_EN : REAL_VS_AI_STATEMENTS
}
