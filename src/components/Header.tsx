import type { UserProgress } from '../types'
import { levelProgress, xpToLevel } from '../storage'

interface Props {
  progress: UserProgress
}

export function Header({ progress }: Props) {
  const level = xpToLevel(progress.xp)
  const xpInLevel = levelProgress(progress.xp)

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon" aria-hidden>
          ⛵
        </div>
        <div>
          <h1>遊艇證照題庫</h1>
          <p>營業用動力小船 · 練習模式</p>
        </div>
      </div>
      <div className="level-pill" title="經驗值與等級">
        <span>
          Lv.<strong>{level}</strong>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>|</span>
        <span>{progress.xp} XP</span>
      </div>
      <div className="xp-bar-wrap" style={{ display: 'none' }} aria-hidden>
        {xpInLevel}%
      </div>
    </header>
  )
}
