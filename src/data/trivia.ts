import type { Lang } from '../context/LanguageContext'
import type { QuizItem } from '../types'

/** Bank soal Speed Trivia — sumber: KONSEP_BOOTH_NAII_CIFP2026.md (15 soal). */
export const TRIVIA_QUESTIONS: QuizItem[] = [
  // ── Kategori 1: CIFP 2026 & Politik Luar Negeri Bebas-Aktif ──
  {
    id: 't1',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'Apa tema utama penyelenggaraan edisi ke-10 CIFP 2026?',
    options: [
      'Globalizing Indonesian Foreign Policy',
      'Independent and Active Foreign Policy: How to Keep Indonesia and the Next World Order Moving in the Right Direction',
      'The Rise of Artificial Intelligence in Southeast Asia',
      'One Decade of ASEAN Centrality',
    ],
    answer: 1,
    info: 'CIFP 2026 merayakan 10 tahun penyelenggaraan dengan menyoroti bagaimana politik luar negeri Bebas-Aktif mengarahkan tatanan dunia baru (Next World Order).',
  },
  {
    id: 't2',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'Siapa tokoh yang mencetuskan doktrin "Bebas-Aktif" lewat pidato "Mendayung di Antara Dua Karang" (1948)?',
    options: ['Ir. Soekarno', 'Sutan Sjahrir', 'Mohammad Hatta', 'Adam Malik'],
    answer: 2,
    info: 'Bung Hatta menegaskan Indonesia tidak memihak blok mana pun (Bebas), namun aktif memperjuangkan perdamaian dan keadilan dunia (Aktif).',
  },
  {
    id: 't3',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'Dalam konteks geopolitik modern, istilah "Global South" merujuk pada…',
    options: [
      'Negara yang secara geografis hanya berada di selatan khatulistiwa',
      'Negara berkembang di Asia, Afrika, dan Amerika Latin yang memperjuangkan tatanan global lebih setara',
      'Pakta pertahanan militer negara-negara Pasifik Selatan',
      'Organisasi perdagangan bebas pengganti WTO',
    ],
    answer: 1,
    info: 'Sejak Konferensi Asia-Afrika 1955 di Bandung, Indonesia menjadi salah satu penggerak utama solidaritas Global South.',
  },
  {
    id: 't4',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'Apa makna prinsip "Bebas-Aktif" jika diterapkan pada diplomasi teknologi & AI Indonesia?',
    options: [
      'Menolak seluruh teknologi AI dari luar negeri',
      'Hanya memakai teknologi dari satu negara adidaya',
      'Bermitra dengan berbagai ekosistem teknologi secara mandiri sambil aktif memperjuangkan etika, kedaulatan data, dan akses AI yang inklusif',
      'Menyerahkan seluruh regulasi AI kepada perusahaan asing',
    ],
    answer: 2,
    info: 'Kemandirian teknologi dan kolaborasi terbuka adalah wujud nyata politik Bebas-Aktif di abad ke-21.',
  },
  {
    id: 't5',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'Organisasi mana yang menjadi penyelenggara tahunan Conference on Indonesian Foreign Policy (CIFP)?',
    options: [
      'Foreign Policy Community of Indonesia (FPCI)',
      'Sekretariat ASEAN',
      'Dewan Keamanan PBB',
      'Lembaga Ketahanan Nasional',
    ],
    answer: 0,
    info: 'FPCI didirikan oleh Dr. Dino Patti Djalal untuk membumikan diplomasi publik (citizen diplomacy) di Indonesia.',
  },

  // ── Kategori 2: Geopolitik AI & Tata Kelola Global ──
  {
    id: 't6',
    category: 'Geopolitik AI',
    prompt: 'Istilah "Sovereign AI" (Kedaulatan AI) berarti…',
    options: [
      'AI yang diberi hak pilih dalam pemilu',
      'Kemampuan bangsa mengembangkan, mengatur, dan mengoperasikan AI sesuai bahasa, budaya, data, dan kepentingan nasionalnya',
      'AI khusus untuk operasi militer luar angkasa',
      'Pelarangan internet lintas negara',
    ],
    answer: 1,
    info: 'Tanpa literasi dan talenta lokal, sebuah negara hanya akan menjadi konsumen pasif di era AI.',
  },
  {
    id: 't7',
    category: 'Geopolitik AI',
    prompt: 'Komponen apa yang menjadi pusat persaingan geopolitik teknologi ("Chip War") karena krusial untuk melatih AI?',
    options: [
      'Kabel serat optik bawah laut',
      'Semikonduktor canggih / GPU',
      'Satelit cuaca orbit rendah',
      'Layar panel OLED',
    ],
    answer: 1,
    info: 'Rantai pasok semikonduktor kini menjadi salah satu isu paling strategis dalam hubungan internasional.',
  },
  {
    id: 't8',
    category: 'Geopolitik AI',
    prompt: 'Apa sifat utama "ASEAN Guide on AI Governance and Ethics" yang diluncurkan tahun 2024?',
    options: [
      'Mendorong inovasi AI yang bertanggung jawab, etis, terpercaya, dan menghormati keberagaman anggota ASEAN',
      'Melarang mahasiswa memakai AI untuk riset',
      'Mewajibkan semua negara ASEAN memakai satu aplikasi AI yang sama',
      'Menghapus hak cipta atas seluruh karya seni digital',
    ],
    answer: 0,
    info: 'Pendekatan ASEAN menyeimbangkan pertumbuhan inovasi ekonomi digital dengan perlindungan masyarakat.',
  },
  {
    id: 't9',
    category: 'Geopolitik AI',
    prompt: 'Mengapa negara Global South perlu aktif menyusun standar etika AI internasional?',
    options: [
      'Agar biaya langganan media sosial lebih mahal',
      'Agar aturan dan model AI global tidak bias ke negara maju, melainkan adil bagi negara berkembang',
      'Karena negara maju sudah berhenti mengembangkan AI',
      'Untuk menggantikan diplomat manusia dengan robot',
    ],
    answer: 1,
    info: 'Inklusivitas dalam tata kelola AI memastikan teknologi memperkecil ketimpangan global, bukan memperlebarnya.',
  },
  {
    id: 't10',
    category: 'Geopolitik AI',
    prompt: 'AI menghasilkan kutipan perjanjian internasional yang terdengar meyakinkan padahal tidak pernah ada. Fenomena ini disebut…',
    options: ['AI Diplomacy', 'AI Hallucination (Halusinasi AI)', 'Deep Learning', 'Cloud Computing'],
    answer: 1,
    info: 'Memahami halusinasi AI krusial bagi mahasiswa HI, peneliti, dan pembuat kebijakan agar tidak terjebak referensi palsu.',
  },

  // ── Kategori 3: Konteks Indonesia, Etika AI & NAII ──
  {
    id: 't11',
    category: 'Indonesia & NAII',
    prompt: 'Regulasi nasional yang menjadi landasan utama perlindungan data warga — termasuk untuk sistem AI — adalah…',
    options: [
      'UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP)',
      'UU Lalu Lintas dan Angkutan Jalan',
      'UU Perdagangan Bebas ASEAN',
      'UU Pemerintahan Daerah',
    ],
    answer: 0,
    info: 'Di www.naii.co ada kursus "Etika AI dari Perspektif Indonesia" yang membahas relevansinya dengan UU PDP.',
  },
  {
    id: 't12',
    category: 'Indonesia & NAII',
    prompt: 'Apa misi utama Nusantara AI Institute (NAII) di www.naii.co?',
    options: [
      'Menjual perangkat keras komputer untuk korporasi',
      'Menyediakan kursus literasi AI berkualitas secara gratis dan inklusif bagi masyarakat Indonesia',
      'Menjadi pemberi pinjaman modal ventura',
      'Membatasi pembelajaran AI hanya untuk lulusan informatika',
    ],
    answer: 1,
    info: 'NAII diinisiasi mahasiswa dan diaspora Indonesia di AS agar siapa pun di Indonesia bisa belajar AI tanpa biaya.',
  },
  {
    id: 't13',
    category: 'Indonesia & NAII',
    prompt: 'Apa tiga pilar kurikulum gratis di www.naii.co?',
    options: [
      'AI Literacy, AI for Business, dan AI Technicals',
      'AI Gaming, AI Crypto, dan AI Hardware',
      'Basic Coding, Graphic Design, dan Video Editing',
      'Macroeconomics, International Law, dan Public Speaking',
    ],
    answer: 0,
    info: 'Pemula non-IT, profesional/eksekutif, hingga developer punya jalur belajar masing-masing di naii.co.',
  },
  {
    id: 't14',
    category: 'Indonesia & NAII',
    prompt: 'Berapa rata-rata durasi satu kursus mandiri (self-paced) di www.naii.co?',
    options: ['6 bulan penuh', '100 jam per modul', 'Sekitar 2–4 jam per kursus', '3 tahun akademik'],
    answer: 2,
    info: 'Kurikulum NAII dirancang ringkas, aplikatif, dan langsung ke studi kasus nyata.',
  },
  {
    id: 't15',
    category: 'Indonesia & NAII',
    prompt: 'Bagi mahasiswa HI atau lulusan baru, kursus gratis mana di www.naii.co yang paling cocok diambil pertama?',
    options: [
      'AI untuk Pencari Kerja & AI dalam Akademik untuk Pelajar dan Mahasiswa',
      'Arsitektur Mesin Pesawat Terbang',
      'Hukum Agraria Tradisional',
      'Manajemen Perhotelan Dasar',
    ],
    answer: 0,
    info: 'Kedua kursus tersebut tersedia gratis di kategori AI Literacy di www.naii.co.',
  },
]

export const TRIVIA_QUESTIONS_EN: QuizItem[] = [
  // ── Category 1: CIFP 2026 & Independent-Active Foreign Policy ──
  {
    id: 't1',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'What is the overarching theme of the 10th edition of CIFP 2026?',
    options: [
      'Globalizing Indonesian Foreign Policy',
      'Independent and Active Foreign Policy: How to Keep Indonesia and the Next World Order Moving in the Right Direction',
      'The Rise of Artificial Intelligence in Southeast Asia',
      'One Decade of ASEAN Centrality',
    ],
    answer: 1,
    info: 'CIFP 2026 celebrates its 10th anniversary by examining how Indonesia’s Independent & Active doctrine steers the Next World Order.',
  },
  {
    id: 't2',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'Who formulated Indonesia’s "Bebas-Aktif" (Independent & Active) doctrine in the historic 1948 speech "Rowing Between Two Reefs"?',
    options: ['Ir. Soekarno', 'Sutan Sjahrir', 'Mohammad Hatta', 'Adam Malik'],
    answer: 2,
    info: 'Vice President Mohammad Hatta affirmed that Indonesia aligns with neither superpower bloc (Independent) while actively championing world peace and justice (Active).',
  },
  {
    id: 't3',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'In modern geopolitical discourse, the term "Global South" refers to…',
    options: [
      'Countries located strictly south of the geographic equator',
      'Developing nations across Asia, Africa, and Latin America advocating for a more equitable global order',
      'A military defense pact of South Pacific island states',
      'A free-trade organization replacing the WTO',
    ],
    answer: 1,
    info: 'Since hosting the 1955 Asian-African Conference in Bandung, Indonesia has been a foundational driving force for Global South solidarity.',
  },
  {
    id: 't4',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'How does Indonesia’s "Independent & Active" principle apply to 21st-century AI and technology diplomacy?',
    options: [
      'Rejecting all foreign AI technologies entirely',
      'Adopting technology exclusively from a single superpower bloc',
      'Partnering across diverse tech ecosystems autonomously while actively championing AI ethics, data sovereignty, and inclusive access',
      'Delegating all domestic AI governance to foreign tech corporations',
    ],
    answer: 2,
    info: 'Technological autonomy paired with open multilateral collaboration is the 21st-century expression of Bebas-Aktif.',
  },
  {
    id: 't5',
    category: 'CIFP & Bebas-Aktif',
    prompt: 'Which organization convenes the annual Conference on Indonesian Foreign Policy (CIFP)?',
    options: [
      'Foreign Policy Community of Indonesia (FPCI)',
      'ASEAN Secretariat',
      'United Nations Security Council',
      'National Resilience Institute (Lemhannas)',
    ],
    answer: 0,
    info: 'FPCI was founded by Dr. Dino Patti Djalal to advance citizen diplomacy and international affairs literacy across Indonesia.',
  },

  // ── Category 2: AI Geopolitics & Global Governance ──
  {
    id: 't6',
    category: 'AI Geopolitics',
    prompt: 'What does the concept of "Sovereign AI" mean for a nation?',
    options: [
      'Granting AI systems voting rights in national elections',
      'A nation’s capacity to develop, govern, and deploy AI aligned with its own languages, culture, data laws, and national interests',
      'AI systems restricted exclusively to orbital space warfare',
      'Shutting down all cross-border internet connectivity',
    ],
    answer: 1,
    info: 'Without local literacy and homegrown talent, a nation risks becoming a mere passive consumer in the global AI era.',
  },
  {
    id: 't7',
    category: 'AI Geopolitics',
    prompt: 'Which hardware component lies at the epicenter of technological geopolitics ("Chip War") because it is essential for training frontier AI?',
    options: [
      'Subsea fiber-optic cables',
      'Advanced semiconductors / GPUs',
      'Low-Earth-orbit weather satellites',
      'OLED display panels',
    ],
    answer: 1,
    info: 'Advanced semiconductor supply chains have become one of the most strategic levers in contemporary international relations.',
  },
  {
    id: 't8',
    category: 'AI Geopolitics',
    prompt: 'What is the core approach of the "ASEAN Guide on AI Governance and Ethics" adopted in 2024?',
    options: [
      'Promoting responsible, ethical, and trustworthy AI innovation while respecting the diversity of ASEAN member states',
      'Prohibiting university students from using AI in academic research',
      'Forcing all ASEAN citizens to use a single state-mandated AI app',
      'Abolishing copyright protection for all digital artworks',
    ],
    answer: 0,
    info: 'ASEAN’s framework balances vibrant digital-economy innovation with practical societal safeguards.',
  },
  {
    id: 't9',
    category: 'AI Geopolitics',
    prompt: 'Why must Global South nations actively participate in shaping international AI ethics and governance standards?',
    options: [
      'To make social media subscriptions more expensive',
      'To ensure global AI rules and models do not remain biased toward advanced economies, but fairly serve developing nations',
      'Because developed countries have halted AI research',
      'To replace human diplomats with automated bots',
    ],
    answer: 1,
    info: 'Inclusive AI governance ensures emerging technology narrows global inequality rather than widening it.',
  },
  {
    id: 't10',
    category: 'AI Geopolitics',
    prompt: 'When an AI model fabricates a convincing citation of an international treaty that never existed, this phenomenon is called…',
    options: ['AI Diplomacy', 'AI Hallucination', 'Deep Learning', 'Cloud Computing'],
    answer: 1,
    info: 'Understanding AI hallucinations is vital for IR students, policy analysts, and diplomats so fabricated citations never enter official briefs.',
  },

  // ── Category 3: Indonesian Context, AI Ethics & NAII ──
  {
    id: 't11',
    category: 'Indonesia & NAII',
    prompt: 'Which national legislation serves as Indonesia’s primary legal pillar for citizen data protection — including in automated AI processing?',
    options: [
      'Law No. 27 of 2022 on Personal Data Protection (UU PDP)',
      'Road Traffic and Transportation Law',
      'ASEAN Free Trade Area Act',
      'Regional Administration Law',
    ],
    answer: 0,
    info: 'At www.naii.co, the course "AI Ethics from an Indonesian Perspective" explores practical compliance with Indonesia’s UU PDP.',
  },
  {
    id: 't12',
    category: 'Indonesia & NAII',
    prompt: 'What is the core mission of Nusantara AI Institute (NAII) at www.naii.co?',
    options: [
      'Selling enterprise server hardware to corporations',
      'Providing high-quality, 100% free, and inclusive AI literacy courses for all Indonesians',
      'Operating as a venture capital lending fund',
      'Restricting AI education exclusively to computer science graduates',
    ],
    answer: 1,
    info: 'NAII was founded by Indonesian students and diaspora in the US so anyone across Indonesia can master AI free of charge.',
  },
  {
    id: 't13',
    category: 'Indonesia & NAII',
    prompt: 'What are the three core curriculum tracks available for free at www.naii.co?',
    options: [
      'AI Literacy, AI for Business, and AI Technicals',
      'AI Gaming, AI Crypto, and AI Hardware',
      'Basic Coding, Graphic Design, and Video Editing',
      'Macroeconomics, International Law, and Public Speaking',
    ],
    answer: 0,
    info: 'From non-technical beginners to executives and software engineers, every learner has a dedicated track at naii.co.',
  },
  {
    id: 't14',
    category: 'Indonesia & NAII',
    prompt: 'What is the average completion time for a self-paced course at www.naii.co?',
    options: ['6 full months', '100 hours per module', 'Around 2–4 hours per course', '3 academic years'],
    answer: 2,
    info: 'NAII’s curriculum is concise, practical, and built around real-world case studies.',
  },
  {
    id: 't15',
    category: 'Indonesia & NAII',
    prompt: 'For International Relations students or fresh graduates, which free courses at www.naii.co are the best starting point?',
    options: [
      'AI for Job Seekers & AI in Academia for Students and Researchers',
      'Jet Engine Propulsion Architecture',
      'Traditional Agrarian Law',
      'Basic Hospitality Management',
    ],
    answer: 0,
    info: 'Both courses are freely accessible under the AI Literacy track at www.naii.co.',
  },
]

export function getTriviaQuestions(lang: Lang = 'id'): QuizItem[] {
  return lang === 'en' ? TRIVIA_QUESTIONS_EN : TRIVIA_QUESTIONS
}
