import type { Question, PracticeFilter, UserProgress } from '../types'
import { getSubcategories } from '../utils'

interface Props {
  questions: Question[]
  progress: UserProgress
  filter: PracticeFilter
  onFilterChange: (filter: PracticeFilter) => void
  onStart: () => void
}

export function PracticeSetup({
  questions,
  progress,
  filter,
  onFilterChange,
  onStart,
}: Props) {
  const categories = [...new Map(questions.map((q) => [q.categoryId, q.category])).entries()]
  const subcategories = getSubcategories(questions)
  const wrongCount = Object.keys(progress.wrongAnswers).length

  const filteredCount = (() => {
    if (filter.mode === 'wrong') return wrongCount
    if (filter.mode === 'category' && filter.categoryId)
      return questions.filter((q) => q.categoryId === filter.categoryId).length
    if (filter.mode === 'subcategory' && filter.subcategoryId)
      return questions.filter((q) => q.subcategoryId === filter.subcategoryId).length
    return questions.length
  })()

  return (
    <div className="card">
      <h2 className="section-title">選擇練習範圍</h2>
      <div className="filter-panel">
        <div>
          <label htmlFor="mode">練習模式</label>
          <select
            id="mode"
            value={filter.mode}
            onChange={(e) =>
              onFilterChange({
                mode: e.target.value as PracticeFilter['mode'],
                categoryId: undefined,
                subcategoryId: undefined,
              })
            }
          >
            <option value="all">全部題目</option>
            <option value="category">依大分類</option>
            <option value="subcategory">依小分類</option>
            <option value="wrong">僅錯題 ({wrongCount})</option>
          </select>
        </div>

        {filter.mode === 'category' && (
          <div>
            <label htmlFor="category">大分類</label>
            <select
              id="category"
              value={filter.categoryId ?? ''}
              onChange={(e) =>
                onFilterChange({ ...filter, categoryId: e.target.value || undefined })
              }
            >
              <option value="">請選擇</option>
              {categories.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {filter.mode === 'subcategory' && (
          <div>
            <label htmlFor="subcategory">小分類</label>
            <select
              id="subcategory"
              value={filter.subcategoryId ?? ''}
              onChange={(e) =>
                onFilterChange({ ...filter, subcategoryId: e.target.value || undefined })
              }
            >
              <option value="">請選擇</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.category} · {s.name} ({s.count}題)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
        本次將練習 <strong style={{ color: 'var(--accent-glow)' }}>{filteredCount}</strong> 題（隨機順序）
      </p>

      <button
        type="button"
        className="btn btn-primary"
        disabled={filteredCount === 0}
        onClick={onStart}
      >
        開始答題
      </button>
    </div>
  )
}
