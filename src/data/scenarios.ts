import type { Lang } from '../context/LanguageContext'
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
    subtitle: 'Kompetisi Semikonduktor & Akses Teknologi AI',
    context:
      'Dua kekuatan besar teknologi dunia memberlakukan pembatasan ekspor semikonduktor dan model AI tingkat lanjut. Negara Global South, termasuk anggota ASEAN, terancam tertinggal dan menghadapi tekanan untuk memilih keberpihakan.',
    question:
      'Sebagai Ketua Delegasi RI yang menganut politik Bebas-Aktif, langkah strategis apa yang Anda ajukan di KTT Internasional untuk menjaga akses teknologi tanpa terseret polarisasi kekuatan?',
    options: [
      {
        id: 'A',
        text: 'Menggalang koalisi Global South & ASEAN untuk membangun infrastruktur Open-Source AI bersama yang netral.',
        dims: { bebas: 88, aktif: 86, teknologi: 80 },
        insight:
          'Langkah klasik "Bebas-Aktif": Indonesia tidak memihak kutub mana pun, tetapi memimpin terbentuknya poros kolaborasi teknologi terbuka.',
        reactions: [
          { bloc: 'Mitra Barat', stance: 'netral', text: 'Mencermati inisiatif ini, namun terbuka bila standar keamanan & transparansi dijaga.' },
          { bloc: 'Poros Mitra Timur', stance: 'netral', text: 'Menyambut sikap non-blok, menawarkan kontribusi riset tanpa syarat politik.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Antusias! Negara-negara mitra berkembang siap bergabung dalam konsorsium.' },
        ],
      },
      {
        id: 'B',
        text: 'Diplomasi ekonomi dua arah: membuka investasi pusat data dari berbagai mitra global dengan syarat transfer ilmu bagi talenta lokal.',
        dims: { bebas: 82, aktif: 70, teknologi: 80 },
        insight:
          'Pragmatis dan menguntungkan secara ekonomi. Kuncinya ada pada negosiasi syarat transfer pengetahuan agar Indonesia tidak sekadar menjadi lokasi server.',
        reactions: [
          { bloc: 'Mitra Barat', stance: 'positif', text: 'Perusahaan teknologi Barat siap berinvestasi, dengan meminta jaminan perlindungan IP.' },
          { bloc: 'Poros Mitra Timur', stance: 'positif', text: 'Siap membangun pusat data dan program beasiswa talenta digital.' },
          { bloc: 'Global South & ASEAN', stance: 'netral', text: 'Menilai Indonesia cerdik, namun mencermati persaingan investasi antarnegara ASEAN.' },
        ],
      },
      {
        id: 'C',
        text: 'Mempelopori traktat PBB tentang akses teknologi AI yang setara sebagai hak pembangunan global.',
        dims: { bebas: 72, aktif: 78, teknologi: 48 },
        insight:
          'Visioner dan berprinsip, tetapi proses traktat PBB memakan waktu bertahun-tahun. Perlu langkah teknis jangka pendek agar talenta lokal tidak tertinggal.',
        reactions: [
          { bloc: 'Mitra Barat', stance: 'waspada', text: 'Khawatir traktat membatasi kebijakan kontrol ekspor demi keamanan nasional mereka.' },
          { bloc: 'Poros Mitra Timur', stance: 'netral', text: 'Mendukung prinsipnya, namun hati-hati soal mekanisme pengawasan.' },
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
      'Bagaimana posisi diplomasi Indonesia untuk menyeimbangkan keterbukaan inovasi global dengan pelindungan kedaulatan data nasional (UU PDP)?',
    options: [
      {
        id: 'A',
        text: 'Mendorong kerangka "ASEAN AI Governance & Data Sovereignty" yang mewajibkan kepatuhan pada hukum lokal seperti UU PDP.',
        dims: { bebas: 84, aktif: 88, teknologi: 76 },
        insight:
          'Memanfaatkan sentralitas ASEAN sebagai daya tawar kolektif — 680 juta penduduk jauh lebih didengar daripada negosiasi bilateral.',
        reactions: [
          { bloc: 'Mitra Barat', stance: 'netral', text: 'Menghormati, membandingkannya dengan pendekatan tata kelola data modern.' },
          { bloc: 'Poros Mitra Timur', stance: 'netral', text: 'Mendukung prinsip kedaulatan data, sejalan dengan regulasi domestik mereka.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Sebagian besar anggota ASEAN mendukung; beberapa meminta masa transisi.' },
        ],
      },
      {
        id: 'B',
        text: 'Memberi insentif bagi perusahaan AI global yang bermitra dengan institusi pendidikan lokal untuk melatih talenta dalam negeri.',
        dims: { bebas: 72, aktif: 70, teknologi: 84 },
        insight:
          'Pendekatan "carrot" yang membangun SDM. Namun tanpa kerangka hukum regional, pelindungan data warga masih rentan.',
        reactions: [
          { bloc: 'Mitra Barat', stance: 'positif', text: 'Perusahaan teknologi menyambut baik dan siap membuka program akademi AI.' },
          { bloc: 'Poros Mitra Timur', stance: 'positif', text: 'Menawarkan kemitraan kampus dan laboratorium riset bersama.' },
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
          { bloc: 'Mitra Barat', stance: 'waspada', text: 'Khawatir standar nasional yang unik menambah beban kepatuhan bisnis.' },
          { bloc: 'Poros Mitra Timur', stance: 'netral', text: 'Menghormati sebagai urusan domestik Indonesia.' },
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
          { bloc: 'Mitra Barat', stance: 'positif', text: 'Menawarkan dukungan alat deteksi deepfake dan intelijen siber.' },
          { bloc: 'Poros Mitra Timur', stance: 'positif', text: 'Mendukung penyelesaian di dalam kerangka ASEAN tanpa intervensi luar.' },
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
          { bloc: 'Mitra Barat', stance: 'netral', text: 'Mendukung de-eskalasi, menunggu klarifikasi resmi.' },
          { bloc: 'Poros Mitra Timur', stance: 'netral', text: 'Menyerukan semua pihak menahan diri.' },
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
          { bloc: 'Mitra Barat', stance: 'positif', text: 'Mendukung standar watermarking, sejalan dengan inisiatif industri mereka.' },
          { bloc: 'Poros Mitra Timur', stance: 'netral', text: 'Setuju prinsipnya, ingin standar tidak didominasi satu pihak.' },
          { bloc: 'Global South & ASEAN', stance: 'netral', text: 'Butuh dukungan kapasitas teknis agar bisa menerapkannya.' },
        ],
      },
    ],
  },
]

export const SCENARIOS_EN: Scenario[] = [
  {
    id: 'ai-divide',
    code: 'SCENARIO 01',
    title: 'The Great AI Divide',
    subtitle: 'Semiconductor Competition & AI Technology Access',
    context:
      'Major competing technology powers impose strict export controls on advanced semiconductors and frontier AI models. Global South nations, including ASEAN members, risk technological marginalization and pressure to pick sides.',
    question:
      'As Head of the Indonesian Delegation upholding an Independent & Active foreign policy, what strategic initiative do you table at the International Summit to secure technological access without aligning with either pole?',
    options: [
      {
        id: 'A',
        text: 'Mobilize a Global South & ASEAN coalition to build shared, neutral Open-Source AI infrastructure.',
        dims: { bebas: 88, aktif: 86, teknologi: 80 },
        insight:
          'A textbook "Independent & Active" move: Indonesia refuses polarization and instead leads a collaborative pole anchored in open technological partnership.',
        reactions: [
          { bloc: 'Western Partners', stance: 'netral', text: 'Monitors the initiative closely, remaining open if safety and transparency standards are upheld.' },
          { bloc: 'Eastern Partners', stance: 'netral', text: 'Welcomes the non-aligned stance and offers research contributions without political strings.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Enthusiastic! Partner nations across the Global South pledge to join the consortium.' },
        ],
      },
      {
        id: 'B',
        text: 'Dual-track economic diplomacy: welcome data center investments from diverse global partners, conditioned on mandatory knowledge transfer for local talent.',
        dims: { bebas: 82, aktif: 70, teknologi: 80 },
        insight:
          'Economically pragmatic. The decisive factor lies in enforcing strict knowledge-transfer clauses so Indonesia becomes a creator, not merely a server host.',
        reactions: [
          { bloc: 'Western Partners', stance: 'positif', text: 'Western tech firms are ready to invest, requesting strong IP protection guarantees.' },
          { bloc: 'Eastern Partners', stance: 'positif', text: 'Ready to build hyperscale data centers and fund digital talent scholarships.' },
          { bloc: 'Global South & ASEAN', stance: 'netral', text: 'Views Indonesia as savvy, though watchful of intra-ASEAN investment competition.' },
        ],
      },
      {
        id: 'C',
        text: 'Spearhead a binding UN Treaty establishing equitable access to AI technology as a universal right to development.',
        dims: { bebas: 72, aktif: 78, teknologi: 48 },
        insight:
          'Visionary and principled, yet UN treaty negotiations take years. Indonesia still needs near-term technical pathways so domestic talent does not fall behind.',
        reactions: [
          { bloc: 'Western Partners', stance: 'waspada', text: 'Concerned the treaty could constrain national-security export controls.' },
          { bloc: 'Eastern Partners', stance: 'netral', text: 'Supports the general principle while remaining cautious on verification mechanisms.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Strongly backs the proposal as a milestone for developmental justice.' },
        ],
      },
    ],
  },
  {
    id: 'data-sovereignty',
    code: 'SCENARIO 02',
    title: 'Sovereign Data vs Global Tech Giants',
    subtitle: 'Data Sovereignty & ASEAN AI Governance',
    context:
      'Multinational tech corporations train frontier AI models on millions of Southeast Asian public and cultural datasets without compensation, risking citizen privacy violations.',
    question:
      'What diplomatic position should Indonesia take to balance openness to global innovation with strict enforcement of national data sovereignty (Personal Data Protection Law / UU PDP)?',
    options: [
      {
        id: 'A',
        text: 'Champion an "ASEAN AI Governance & Data Sovereignty" framework mandating compliance with local laws such as Indonesia’s UU PDP.',
        dims: { bebas: 84, aktif: 88, teknologi: 76 },
        insight:
          'Leverages ASEAN Centrality for collective bargaining power — a market of 680 million people commands far greater leverage than bilateral talks alone.',
        reactions: [
          { bloc: 'Western Partners', stance: 'netral', text: 'Respects the regulatory clarity, comparing it to modern data-protection frameworks.' },
          { bloc: 'Eastern Partners', stance: 'netral', text: 'Supports the principle of data sovereignty, aligning with their own domestic regulations.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Most ASEAN member states endorse the framework; a few request phased transition timelines.' },
        ],
      },
      {
        id: 'B',
        text: 'Offer incentives to global AI firms that partner with Indonesian universities and institutions to train domestic AI talent.',
        dims: { bebas: 72, aktif: 70, teknologi: 84 },
        insight:
          'A constructive "carrot" approach that accelerates human capital, though citizen data remains vulnerable without a binding regional legal framework.',
        reactions: [
          { bloc: 'Western Partners', stance: 'positif', text: 'Global tech firms welcome the partnership and commit to launching AI academies.' },
          { bloc: 'Eastern Partners', stance: 'positif', text: 'Offers joint university laboratories and engineering fellowships.' },
          { bloc: 'Global South & ASEAN', stance: 'netral', text: 'Appreciates the talent focus while awaiting concrete safeguards for citizen privacy.' },
        ],
      },
      {
        id: 'C',
        text: 'Establish a national Nusantara AI Ethics Standard protecting indigenous intellectual property, regional languages, and citizen privacy.',
        dims: { bebas: 82, aktif: 56, teknologi: 70 },
        insight:
          'Strong on safeguarding digital cultural sovereignty, though somewhat inward-looking. Elevating it to a regional forum would amplify its global impact.',
        reactions: [
          { bloc: 'Western Partners', stance: 'waspada', text: 'Concerned bespoke national rules may increase cross-border compliance friction.' },
          { bloc: 'Eastern Partners', stance: 'netral', text: 'Respects the measure as Indonesia’s sovereign domestic affair.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Linguistically diverse nations express strong interest in adopting a similar model.' },
        ],
      },
    ],
  },
  {
    id: 'deepfake-crisis',
    code: 'SCENARIO 03',
    title: 'Hybrid Information Warfare',
    subtitle: 'Deepfake Disinformation Crisis in the Indo-Pacific',
    context:
      'An ultra-realistic deepfake video showing a neighboring head of state announcing military provocation goes viral, triggering market panic and acute diplomatic tension across Southeast Asia.',
    question:
      'What crisis diplomacy measure does Indonesia execute in the first 24 hours to keep the region stable and moving in the right direction?',
    options: [
      {
        id: 'A',
        text: 'Activate the ASEAN diplomatic hotline and deploy a cross-border Joint AI Forensic Verification Task Force.',
        dims: { bebas: 80, aktif: 90, teknologi: 88 },
        insight:
          'Rapid, collective, and technically grounded. Joint forensic verification dismantles fabricated narratives before military escalation can occur.',
        reactions: [
          { bloc: 'Western Partners', stance: 'positif', text: 'Offers deepfake detection tools and cyber threat intelligence support.' },
          { bloc: 'Eastern Partners', stance: 'positif', text: 'Endorses ASEAN-led resolution without external military intervention.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Neighboring capitals are relieved — a joint communiqué is issued within 6 hours.' },
        ],
      },
      {
        id: 'B',
        text: 'Issue a joint call for restraint (de-escalation) while launching an emergency public literacy drive on detecting AI manipulation.',
        dims: { bebas: 78, aktif: 70, teknologi: 70 },
        insight:
          'Calms immediate tensions and builds long-term societal resilience, though without rapid technical verification, rumors may linger.',
        reactions: [
          { bloc: 'Western Partners', stance: 'netral', text: 'Supports de-escalation while awaiting authoritative forensic clarification.' },
          { bloc: 'Eastern Partners', stance: 'netral', text: 'Echoes calls for all parties to exercise maximum restraint.' },
          { bloc: 'Global South & ASEAN', stance: 'positif', text: 'Commends Indonesia’s steady and calming diplomatic leadership.' },
        ],
      },
      {
        id: 'C',
        text: 'Propose a regional cybersecurity and mandatory AI content watermarking protocol within ASEAN defense cooperation.',
        dims: { bebas: 74, aktif: 72, teknologi: 86 },
        insight:
          'A vital structural solution to prevent future crises, though less focused on defusing the immediate 24-hour flashpoint.',
        reactions: [
          { bloc: 'Western Partners', stance: 'positif', text: 'Backs provenance and watermarking standards aligned with global industry norms.' },
          { bloc: 'Eastern Partners', stance: 'netral', text: 'Agrees in principle, provided technical standards are not monopolized by one pole.' },
          { bloc: 'Global South & ASEAN', stance: 'netral', text: 'Supports the protocol but requests technical capacity-building assistance.' },
        ],
      },
    ],
  },
]

export function getScenarios(lang: Lang = 'id'): Scenario[] {
  return lang === 'en' ? SCENARIOS_EN : SCENARIOS
}
