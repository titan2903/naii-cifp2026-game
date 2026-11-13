export type GameId = 'trivia' | 'realvsai' | 'battle'

export interface Player {
  name: string
  institution: string
  email: string
  consent: boolean
}

export interface ScoreEntry {
  id: string
  player_name: string
  institution: string
  game: GameId
  score: number
  correct_count: number
  total_questions: number
  time_seconds: number
  session_tag: string
  created_at: string
}

export type NewScore = Omit<ScoreEntry, 'id' | 'created_at'>

/** Soal generik untuk QuizGame (dipakai Speed Trivia & Real vs AI). */
export interface QuizItem {
  id: string
  category?: string
  prompt: string
  options: string[]
  answer: number
  info: string
}

export type Bloc =
  | 'Blok Barat'
  | 'Tiongkok & Mitra Timur'
  | 'Global South & ASEAN'
  | 'Western Bloc'
  | 'China & Eastern Partners'
export type Stance = 'positif' | 'netral' | 'waspada'

export interface WorldReaction {
  bloc: Bloc
  stance: Stance
  text: string
}

export interface Dimensions {
  bebas: number
  aktif: number
  teknologi: number
}

export interface ScenarioOption {
  id: 'A' | 'B' | 'C'
  text: string
  dims: Dimensions
  reactions: WorldReaction[]
  insight: string
}

export interface Scenario {
  id: string
  code: string
  title: string
  subtitle: string
  context: string
  question: string
  options: ScenarioOption[]
}

export type PersonaId = 'bridge-builder' | 'sovereign-guardian' | 'pragmatic-negotiator'

export interface Persona {
  id: PersonaId
  title: string
  range: string
  tagline: string
  description: string
  courses: string[]
  accent: string
}

export interface SimulationResult {
  scenario: Scenario
  option: ScenarioOption
  customNote: string
  dims: Dimensions
  score: number
  persona: Persona
  matchedKeywords: string[]
  penalties: string[]
}

export interface PromptPillar {
  name: string
  score: number
  maxScore: number
  detected: string[]
  feedback: string
}

export interface PromptBattleMission {
  id: string
  code: string
  title: string
  topic: string
  scenario: string
  task: string
  guidelines: string[]
  starterTemplate: string
}

export interface PromptEvaluation {
  score: number
  grade: 'S' | 'A' | 'B' | 'C'
  pillars: {
    role: PromptPillar
    context: PromptPillar
    constraint: PromptPillar
    objective: PromptPillar
  }
  simulatedOutput: string
  feedback: string
}

