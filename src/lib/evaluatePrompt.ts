import type { Lang } from '../context/LanguageContext'
import { PILLAR_KEYWORDS } from '../data/promptBattle'
import type { PromptBattleMission, PromptEvaluation, PromptPillar } from '../types'

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const hasWord = (text: string, phrase: string) =>
  new RegExp(`(^|[^a-z0-9])${escape(phrase)}([^a-z0-9]|$)`, 'i').test(text)

function assessPillar(
  pillarName: string,
  text: string,
  keywordsId: readonly string[],
  keywordsEn: readonly string[],
  lang: Lang,
): PromptPillar {
  const en = lang === 'en'
  const matched: string[] = []

  for (const kw of [...keywordsId, ...keywordsEn]) {
    if (hasWord(text, kw)) {
      matched.push(kw)
    }
  }

  const unique = [...new Set(matched)]
  const count = unique.length

  // Base score distribution: 0 hits = 0, 1 hit = 15, 2 hits = 21, 3+ hits = 25
  let score = 0
  if (count === 1) score = 16
  else if (count === 2) score = 21
  else if (count >= 3) score = 25

  let feedback = ''
  if (score === 25) {
    feedback = en ? 'Excellently specified.' : 'Sangat spesifik & terstruktur.'
  } else if (score >= 16) {
    feedback = en ? 'Adequate, but could be sharper.' : 'Cukup terdefinisi, masih bisa dipertajam.'
  } else {
    feedback = en ? 'Missing or unclear.' : 'Belum terdefinisi dengan jelas.'
  }

  return {
    name: pillarName,
    score,
    maxScore: 25,
    detected: unique,
    feedback,
  }
}

export function evaluatePrompt(
  promptText: string,
  mission: PromptBattleMission,
  lang: Lang = 'id',
): PromptEvaluation {
  const text = promptText.trim().toLowerCase()
  const en = lang === 'en'

  const role = assessPillar(
    en ? 'Role' : 'Peran',
    text,
    PILLAR_KEYWORDS.role.id,
    PILLAR_KEYWORDS.role.en,
    lang,
  )
  const context = assessPillar(
    en ? 'Context' : 'Konteks',
    text,
    PILLAR_KEYWORDS.context.id,
    PILLAR_KEYWORDS.context.en,
    lang,
  )
  const constraint = assessPillar(
    en ? 'Constraint' : 'Batasan',
    text,
    PILLAR_KEYWORDS.constraint.id,
    PILLAR_KEYWORDS.constraint.en,
    lang,
  )
  const objective = assessPillar(
    en ? 'Objective' : 'Tujuan',
    text,
    PILLAR_KEYWORDS.objective.id,
    PILLAR_KEYWORDS.objective.en,
    lang,
  )

  // Minimum length check
  const wordCount = promptText.trim().split(/\s+/).filter(Boolean).length
  let lengthPenalty = 0
  if (wordCount < 8) lengthPenalty = 20
  else if (wordCount < 15) lengthPenalty = 8

  const rawScore = Math.max(0, role.score + context.score + constraint.score + objective.score - lengthPenalty)
  const score = Math.min(100, Math.round(rawScore))

  let grade: 'S' | 'A' | 'B' | 'C' = 'C'
  if (score >= 90) grade = 'S'
  else if (score >= 75) grade = 'A'
  else if (score >= 55) grade = 'B'

  // Dynamic simulated speech generation based on prompt quality & mission topic
  let simulatedOutput = ''
  if (en) {
    if (grade === 'S') {
      if (mission.id === 'mission-treaty') {
        simulatedOutput =
          '“Mr. President and esteemed delegates, Indonesia presents a three-point Global South compromise for the UN AI Treaty: (1) An equitable tiered compliance mechanism where advanced AI safety thresholds are paired with mandatory multilateral capacity-building funds; (2) An open technology transfer protocol to ensure developing nations are not locked out of foundational models; and (3) A non-aligned oversight panel under the UN General Assembly that respects both safety benchmarks and digital sovereignty.”'
      } else if (mission.id === 'mission-cyber') {
        simulatedOutput =
          '“To the ASEAN Secretariat and member states: The Republic of Indonesia formally conveys its diplomatic initiative in response to the recent regional data breach. In full alignment with our Personal Data Protection Law (UU PDP) and the principle of regional solidarity, Indonesia calls for the immediate activation of an ASEAN Cyber Forensic Joint Taskforce to conduct transparent evidence-based investigations while defusing mutual accusations.”'
      } else {
        simulatedOutput =
          '“Excellencies and esteemed delegates, the digital commons of the Indo-Pacific must remain a shared bridge for peace rather than a theater of great-power confrontation. Indonesia reaffirms its constitutional Independent and Active doctrine: we will neither align with rival technology blocs nor allow vital sea lines and orbital communication pathways to be weaponized. Through ASEAN Centrality and the collective voice of the Global South, we formally propose the establishment of a neutral Indo-Pacific Digital Peace Corridor.”'
      }
    } else if (grade === 'A') {
      simulatedOutput = `“Distinguished colleagues, Indonesia calls upon all parties involved in the ${mission.title} to exercise immediate restraint. Our Independent and Active foreign policy dictates that Southeast Asia must remain open, peaceful, and cooperative. We encourage neighboring states to engage in direct diplomatic dialogue within the ASEAN framework.”`
    } else {
      simulatedOutput = `“Good morning everyone. The situation regarding ${mission.title} is very important for our world today and we must avoid conflict. All countries should work together and make sure technology remains safe.” (Generic output: lacks diplomatic authority, concrete policy levers, and Indonesian Bebas-Aktif doctrine).`
    }
  } else {
    if (grade === 'S') {
      if (mission.id === 'mission-treaty') {
        simulatedOutput =
          '“Yang Mulia Ketua Sidang dan para delegasi, Indonesia menyampaikan 3 butir kompromi Global South untuk Traktat AI PBB: (1) Mekanisme kepatuhan berjenjang di mana standar keselamatan AI diimbangi kewajiban pendanaan transfer teknologi bagi negara berkembang; (2) Jaminan akses terbuka agar negara berkembang tidak menjadi sekadar konsumen pasif model tertutup; dan (3) Badan pengawas independen PBB yang menjamin tidak adanya monopoli atau sanksi sepihak antar-blok.”'
      } else if (mission.id === 'mission-cyber') {
        simulatedOutput =
          '“Kepada Sekretariat ASEAN dan negara anggota: Republik Indonesia menyampaikan inisiatif diplomatik resmi menanggapi kebocoran data regional. Berlandaskan UU Pelindungan Data Pribadi (UU PDP) dan asas gotong royong regional, Indonesia mengusulkan pembentukan Satgas Forensik Siber Bersama ASEAN guna menjamin investigasi objektif dan meredakan ketegangan diplomatik bilateral.”'
      } else {
        simulatedOutput =
          '“Yang Mulia para delegasi, ruang digital dan jalur komunikasi Indo-Pasifik adalah urat nadi bersama, bukan medan konfrontasi pakta kekuatan besar. Republik Indonesia, berpijak teguh pada doktrin Politik Bebas-Aktif, menegaskan sikap non-blok: kami menolak pemaksaan aliansi teknologi dan mengecam segala bentuk embargo infrastruktur telekomunikasi lintas batas. Melalui Sentralitas ASEAN dan solidaritas Global South, Indonesia menyerukan de-eskalasi segera serta mengusulkan pembentukan Zona Damai Digital Indo-Pasifik.”'
      }
    } else if (grade === 'A') {
      simulatedOutput = `“Yang terhormat para utusan negara sahabat, Indonesia menyerukan kepada semua pihak dalam isu ${mission.title} untuk segera menahan diri. Sejalan dengan prinsip politik luar negeri Bebas-Aktif, Indonesia mengutamakan dialog konstruktif dan penyelesaian damai melalui kerangka ASEAN agar stabilitas kawasan tetap terjaga.”`
    } else {
      simulatedOutput = `“Selamat pagi hadirin sekalian. Masalah ${mission.title} saat ini sangat penting bagi perdamaian dunia. Jangan sampai kita saling tuduh. Mari kita saling bekerja sama demi masa depan yang lebih baik.” (Output dangkal & generik: kehilangan wibawa diplomatik serta tidak menyentuh doktrin Bebas-Aktif).`
    }
  }

  let feedback = ''
  if (grade === 'S') {
    feedback = en
      ? 'Outstanding policy-grade prompt! Perfectly articulates all 4 NAII pillars: authoritative role, clear geopolitical context, precise constraints, and high-impact objective.'
      : 'Luar biasa! Prompt berstandar analis diplomatik. Keempat pilar NAII (Peran, Konteks, Batasan, Tujuan) terpenuhi dengan tajam dan terstruktur.'
  } else if (grade === 'A') {
    feedback = en
      ? 'Strong prompt! To reach Grade S, add sharper format boundaries (e.g., "strictly 1 paragraph") and explicit doctrine terms.'
      : 'Prompt sudah sangat baik! Untuk menembus Grade S, pertegas batasan format (misal: "maksimal 1 paragraf") dan doktrin Bebas-Aktif.'
  } else if (grade === 'B') {
    feedback = en
      ? 'Promising start. Strengthen your prompt by clearly establishing the persona ("Act as...") and specific ASEAN / Global South context.'
      : 'Cukup baik. Perkuat prompt dengan menetapkan peran ("Bertindaklah sebagai...") serta konteks spesifik ketegangan kawasan ASEAN.'
  } else {
    feedback = en
      ? 'The prompt is too generic. Remember the 4 NAII Pillars: Role, Context, Constraint, and Objective taught for free at www.naii.co.'
      : 'Prompt masih terlalu umum. Gunakan 4 Pilar NAII: Peran (Role), Konteks (Context), Batasan (Constraint), dan Tujuan (Objective) yang diajarkan gratis di www.naii.co.'
  }

  return {
    score,
    grade,
    pillars: { role, context, constraint, objective },
    simulatedOutput,
    feedback,
  }
}
