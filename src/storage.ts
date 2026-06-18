import type { UserProgress, WrongRecord, AnswerRecord } from './types'

const STORAGE_KEY = 'yacht-license-progress-v1'

export const defaultProgress = (): UserProgress => ({
  totalAnswered: 0,
  totalCorrect: 0,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastPracticeDate: '',
  wrongAnswers: {},
  answeredIds: {},
})

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    return { ...defaultProgress(), ...JSON.parse(raw) }
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function updateStreak(progress: UserProgress): UserProgress {
  const today = todayKey()
  if (progress.lastPracticeDate === today) return progress

  const nextStreak =
    progress.lastPracticeDate === yesterdayKey() ? progress.streak + 1 : 1

  return {
    ...progress,
    streak: nextStreak,
    bestStreak: Math.max(progress.bestStreak, nextStreak),
    lastPracticeDate: today,
  }
}

export function recordAnswer(
  progress: UserProgress,
  questionId: string,
  correct: boolean,
  meta: Pick<WrongRecord, 'categoryId' | 'category' | 'subcategoryId' | 'subcategory'>,
  selected?: string,
): UserProgress {
  const now = new Date().toISOString()
  let next = updateStreak({ ...progress })
  const answeredIds: Record<string, AnswerRecord> = {
    ...next.answeredIds,
    [questionId]: { correct, at: now },
  }
  const wrongAnswers = { ...next.wrongAnswers }

  if (correct) {
    delete wrongAnswers[questionId]
  } else {
    const prev = wrongAnswers[questionId]
    wrongAnswers[questionId] = {
      questionId,
      ...meta,
      wrongCount: (prev?.wrongCount ?? 0) + 1,
      lastWrongAt: now,
      lastSelected: selected,
    }
  }

  const wasAnswered = questionId in next.answeredIds
  next = {
    ...next,
    answeredIds,
    wrongAnswers,
    totalAnswered: wasAnswered ? next.totalAnswered : next.totalAnswered + 1,
    totalCorrect:
      correct && !wasAnswered
        ? next.totalCorrect + 1
        : !correct && wasAnswered && next.answeredIds[questionId]?.correct
          ? next.totalCorrect - 1
          : next.totalCorrect,
    xp: next.xp + (correct ? 10 + Math.min(next.streak, 5) : 2),
  }

  return next
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function xpToLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

export function levelProgress(xp: number): number {
  return xp % 100
}
