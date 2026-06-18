export interface QuestionOption {
  key: string
  text: string
}

export interface Question {
  id: string
  number: number
  categoryId: string
  category: string
  subcategoryId: string
  subcategory: string
  question: string
  options: QuestionOption[]
  answer: string
}

export interface WrongRecord {
  questionId: string
  categoryId: string
  category: string
  subcategoryId: string
  subcategory: string
  wrongCount: number
  lastWrongAt: string
  lastSelected?: string
}

export interface AnswerRecord {
  correct: boolean
  at: string
}

export interface UserProgress {
  totalAnswered: number
  totalCorrect: number
  xp: number
  streak: number
  bestStreak: number
  lastPracticeDate: string
  wrongAnswers: Record<string, WrongRecord>
  answeredIds: Record<string, AnswerRecord>
}

export type View = 'home' | 'practice' | 'review' | 'stats'

export interface PracticeFilter {
  mode: 'all' | 'category' | 'subcategory' | 'wrong'
  categoryId?: string
  subcategoryId?: string
}

export interface CategoryStat {
  categoryId: string
  category: string
  total: number
  answered: number
  correct: number
  wrong: number
}
