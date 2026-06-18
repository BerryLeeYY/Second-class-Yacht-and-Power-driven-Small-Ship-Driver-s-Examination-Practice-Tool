import type { Question, UserProgress } from '../types'

interface Props {
  questions: Question[]
  progress: UserProgress
  onPracticeWrong: (subcategoryId?: string) => void
}

export function ReviewView({ questions, progress, onPracticeWrong }: Props) {
  const wrongIds = Object.keys(progress.wrongAnswers)
  const byCategory = new Map<
    string,
    { category: string; items: { record: (typeof progress.wrongAnswers)[string]; question?: Question }[] }
  >()

  for (const id of wrongIds) {
    const record = progress.wrongAnswers[id]
    const question = questions.find((q) => q.id === id)
    const group = byCategory.get(record.categoryId)
    const item = { record, question }
    if (group) group.items.push(item)
    else byCategory.set(record.categoryId, { category: record.category, items: [item] })
  }

  if (wrongIds.length === 0) {
    return (
      <div className="card empty-state">
        <div className="emoji">🎉</div>
        <p>目前沒有錯題記錄，繼續加油！</p>
      </div>
    )
  }

  return (
    <>
      <div className="card">
        <h2 className="section-title">錯題本 · 共 {wrongIds.length} 題</h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          錯題依大分類歸檔。答對後會自動從錯題本移除。
        </p>
        <button type="button" className="btn btn-primary" onClick={() => onPracticeWrong()}>
          複習全部錯題
        </button>
      </div>

      {[...byCategory.entries()].map(([catId, group]) => (
        <div key={catId} className="card wrong-group">
          <h3>
            {group.category}（{group.items.length} 題）
          </h3>
          {group.items
            .sort((a, b) => b.record.wrongCount - a.record.wrongCount)
            .map(({ record, question }) => (
              <div key={record.questionId} className="wrong-item">
                <div className="q-preview">
                  {question?.question ?? record.questionId}
                </div>
                <div className="meta">
                  {record.subcategory} · 錯 {record.wrongCount} 次
                  {record.lastSelected && ` · 上次選 ${record.lastSelected}`}
                </div>
              </div>
            ))}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.5rem' }}
            onClick={() => onPracticeWrong(catId)}
          >
            練習此分類錯題
          </button>
        </div>
      ))}
    </>
  )
}
