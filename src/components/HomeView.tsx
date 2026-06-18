import type { UserProgress } from '../types'
import { accuracy } from '../utils'
import { levelProgress, xpToLevel } from '../storage'

interface Props {
  progress: UserProgress
  totalQuestions: number
  onStartAll: () => void
  onStartWrong: () => void
}

export function HomeView({ progress, totalQuestions, onStartAll, onStartWrong }: Props) {
  const wrongCount = Object.keys(progress.wrongAnswers).length
  const answeredCount = Object.keys(progress.answeredIds).length
  const level = xpToLevel(progress.xp)
  const xpPct = levelProgress(progress.xp)

  return (
    <>
      <div className="card">
        <h2 className="section-title">航海進度</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="value">{answeredCount}</div>
            <div className="label">已作答</div>
          </div>
          <div className="stat-box">
            <div className="value">{totalQuestions}</div>
            <div className="label">題庫總數</div>
          </div>
          <div className="stat-box">
            <div className="value">{accuracy(progress)}%</div>
            <div className="label">正確率</div>
          </div>
          <div className="stat-box">
            <div className="value">{progress.streak}</div>
            <div className="label">連續天數 🔥</div>
          </div>
        </div>

        <div className="xp-bar-wrap">
          <div className="xp-bar-label">
            <span>
              等級 {level} → {level + 1}
            </span>
            <span>{xpPct} / 100 XP</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onStartAll}>
            開始練習
          </button>
          {wrongCount > 0 && (
            <button type="button" className="btn btn-secondary" onClick={onStartWrong}>
              複習錯題 ({wrongCount})
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">遊戲化說明</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          答對獲得 10+ XP（連續練習有加成），答錯仍獲 2 XP。錯題會依「大分類／小分類」自動歸檔，可在「錯題本」與「統計」中檢視弱點。
        </p>
      </div>
    </>
  )
}
