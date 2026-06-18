import type { Question, UserProgress } from '../types'
import { buildCategoryStats } from '../utils'

interface Props {
  questions: Question[]
  progress: UserProgress
  onPracticeCategory: (categoryId: string) => void
  onReset: () => void
}

export function StatsView({ questions, progress, onPracticeCategory, onReset }: Props) {
  const stats = buildCategoryStats(questions, progress)
  const wrongBySub = new Map<string, { name: string; category: string; count: number }>()

  for (const record of Object.values(progress.wrongAnswers)) {
    const key = record.subcategoryId
    const row = wrongBySub.get(key)
    if (row) row.count += 1
    else
      wrongBySub.set(key, {
        name: record.subcategory,
        category: record.category,
        count: 1,
      })
  }

  const weakSubs = [...wrongBySub.values()].sort((a, b) => b.count - a.count).slice(0, 8)

  return (
    <>
      <div className="card">
        <h2 className="section-title">分類答題進度</h2>
        <div className="category-list">
          {stats.map((s) => {
            const pct = s.total ? Math.round((s.answered / s.total) * 100) : 0
            const acc = s.answered ? Math.round((s.correct / s.answered) * 100) : 0
            return (
              <div key={s.categoryId} className="category-row">
                <div>
                  <div className="name">{s.category}</div>
                  <div className="meta">
                    {s.answered}/{s.total} 已答 · 正確率 {acc}% · 錯題 {s.wrong}
                  </div>
                  <div className="bar-track" style={{ marginTop: '0.4rem' }}>
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onPracticeCategory(s.categoryId)}
                  >
                    練習
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {weakSubs.length > 0 && (
        <div className="card">
          <h2 className="section-title">弱點小分類（錯題數）</h2>
          <div className="bar-chart">
            {weakSubs.map((s) => {
              const max = weakSubs[0]?.count ?? 1
              const pct = Math.round((s.count / max) * 100)
              return (
                <div key={s.name} className="bar-row">
                  <span title={`${s.category} · ${s.name}`}>
                    {s.name.length > 8 ? s.name.slice(0, 8) + '…' : s.name}
                  </span>
                  <div className="bar-track">
                    <div className="bar-fill weak" style={{ width: `${pct}%` }} />
                  </div>
                  <span>{s.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="section-title">資料管理</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>
          進度儲存於本機瀏覽器，清除後無法復原。
        </p>
        <button type="button" className="btn btn-danger btn-sm" onClick={onReset}>
          重置所有進度
        </button>
      </div>
    </>
  )
}
