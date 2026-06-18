import type { Question, CategoryStat, PracticeFilter } from './types'
import type { UserProgress } from './types'

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function filterQuestions(
  questions: Question[],
  progress: UserProgress,
  filter: PracticeFilter,
): Question[] {
  let pool = questions

  if (filter.mode === 'wrong') {
    const wrongIds = new Set(Object.keys(progress.wrongAnswers))
    pool = pool.filter((q) => wrongIds.has(q.id))
  } else if (filter.mode === 'category' && filter.categoryId) {
    pool = pool.filter((q) => q.categoryId === filter.categoryId)
  } else if (filter.mode === 'subcategory' && filter.subcategoryId) {
    pool = pool.filter((q) => q.subcategoryId === filter.subcategoryId)
  }

  return shuffle(pool)
}

export function buildCategoryStats(
  questions: Question[],
  progress: UserProgress,
): CategoryStat[] {
  const map = new Map<string, CategoryStat>()

  for (const q of questions) {
    const existing = map.get(q.categoryId)
    const answered = progress.answeredIds[q.id]
    if (!existing) {
      map.set(q.categoryId, {
        categoryId: q.categoryId,
        category: q.category,
        total: 1,
        answered: answered ? 1 : 0,
        correct: answered?.correct ? 1 : 0,
        wrong: progress.wrongAnswers[q.id] ? 1 : 0,
      })
    } else {
      existing.total += 1
      if (answered) existing.answered += 1
      if (answered?.correct) existing.correct += 1
      if (progress.wrongAnswers[q.id]) existing.wrong += 1
    }
  }

  return [...map.values()]
}

export function getSubcategories(questions: Question[]): {
  id: string
  name: string
  categoryId: string
  category: string
  count: number
}[] {
  const map = new Map<
    string,
    { id: string; name: string; categoryId: string; category: string; count: number }
  >()
  for (const q of questions) {
    const key = q.subcategoryId
    const row = map.get(key)
    if (row) row.count += 1
    else
      map.set(key, {
        id: q.subcategoryId,
        name: q.subcategory,
        categoryId: q.categoryId,
        category: q.category,
        count: 1,
      })
  }
  return [...map.values()]
}

export function accuracy(progress: UserProgress): number {
  if (!progress.totalAnswered) return 0
  const correct = Object.values(progress.answeredIds).filter((a) => a.correct).length
  return Math.round((correct / progress.totalAnswered) * 100)
}
