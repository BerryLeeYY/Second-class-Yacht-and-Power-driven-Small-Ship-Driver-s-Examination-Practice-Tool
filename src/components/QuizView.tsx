import { useState } from 'react'
import type { Question } from '../types'

interface Props {
  question: Question
  index: number
  total: number
  sessionCorrect: number
  onAnswer: (selected: string, correct: boolean) => void
  onNext: () => void
  onExit: () => void
}

export function QuizView({
  question,
  index,
  total,
  sessionCorrect,
  onAnswer,
  onNext,
  onExit,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (key: string) => {
    if (revealed) return
    setSelected(key)
    const correct = key === question.answer
    setRevealed(true)
    onAnswer(key, correct)
  }

  const handleNext = () => {
    setSelected(null)
    setRevealed(false)
    onNext()
  }

  return (
    <div className="card">
      <div className="quiz-header">
        <div className="quiz-progress">
          第 {index + 1} / {total} 題 · 本輪正確 {sessionCorrect}
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onExit}>
          結束練習
        </button>
      </div>

      <div className="quiz-tags">
        <span className="tag">{question.category}</span>
        <span className="tag">{question.subcategory}</span>
        <span className="tag">#{question.number}</span>
      </div>

      <p className="question-text">{question.question}</p>

      <div className="options">
        {question.options.map((opt) => {
          let className = 'option-btn'
          if (revealed) {
            if (opt.key === question.answer) className += ' correct'
            else if (opt.key === selected) className += ' wrong'
          }
          return (
            <button
              key={opt.key}
              type="button"
              className={className}
              disabled={revealed}
              onClick={() => handleSelect(opt.key)}
            >
              <span className="option-key">{opt.key}</span>
              <span>{opt.text}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <>
          <div className={`feedback ${selected === question.answer ? 'success' : 'error'}`}>
            {selected === question.answer ? (
              <>✓ 答對了！+XP</>
            ) : (
              <>
                ✗ 答錯了。正確答案：<strong>{question.answer}</strong>
                {selected && <>（你選了 {selected}）</>}
                <br />
                <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                  已記錄至錯題本 · {question.category} / {question.subcategory}
                </span>
              </>
            )}
          </div>
          <div className="quiz-actions">
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              {index + 1 < total ? '下一題' : '完成練習'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
