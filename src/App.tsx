import { useCallback, useMemo, useState } from 'react'
import questionsData from './data/questions.json'
import { Header } from './components/Header'
import { HomeView } from './components/HomeView'
import { PracticeSetup } from './components/PracticeSetup'
import { QuizView } from './components/QuizView'
import { ReviewView } from './components/ReviewView'
import { StatsView } from './components/StatsView'
import {
  defaultProgress,
  loadProgress,
  recordAnswer,
  resetProgress,
  saveProgress,
} from './storage'
import { filterQuestions } from './utils'
import type { PracticeFilter, Question, UserProgress, View } from './types'

const questions = questionsData as Question[]

type QuizPhase = 'setup' | 'active' | 'done'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [progress, setProgress] = useState<UserProgress>(loadProgress)
  const [filter, setFilter] = useState<PracticeFilter>({ mode: 'all' })
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('setup')
  const [quizQueue, setQuizQueue] = useState<Question[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)

  const startPractice = useCallback(
    (customFilter?: PracticeFilter) => {
      const f = customFilter ?? filter
      const pool = filterQuestions(questions, progress, f)
      if (!pool.length) return
      setQuizQueue(pool)
      setQuizIndex(0)
      setSessionCorrect(0)
      setQuizPhase('active')
      if (customFilter) setFilter(customFilter)
      setView('practice')
    },
    [filter, progress],
  )

  const handleAnswer = (selected: string, correct: boolean) => {
    const q = quizQueue[quizIndex]
    if (!q) return
    if (correct) setSessionCorrect((n) => n + 1)
    setProgress((prev) => {
      const next = recordAnswer(
        prev,
        q.id,
        correct,
        {
          categoryId: q.categoryId,
          category: q.category,
          subcategoryId: q.subcategoryId,
          subcategory: q.subcategory,
        },
        selected,
      )
      saveProgress(next)
      return next
    })
  }

  const handleNext = () => {
    if (quizIndex + 1 < quizQueue.length) {
      setQuizIndex((i) => i + 1)
    } else {
      setQuizPhase('done')
    }
  }

  const handleExitQuiz = () => {
    setQuizPhase('setup')
    setView('home')
  }

  const handleStartWrong = () => {
    startPractice({ mode: 'wrong' })
  }

  const handlePracticeWrongCategory = (categoryId?: string) => {
    if (!categoryId) {
      startPractice({ mode: 'wrong' })
      return
    }
    const wrongInCat = questions.filter(
      (q) => q.categoryId === categoryId && progress.wrongAnswers[q.id],
    )
    if (!wrongInCat.length) return
    setQuizQueue(wrongInCat)
    setQuizIndex(0)
    setSessionCorrect(0)
    setQuizPhase('active')
    setView('practice')
  }

  const tabs: { id: View; label: string }[] = useMemo(
    () => [
      { id: 'home', label: '首頁' },
      { id: 'practice', label: '練習' },
      { id: 'review', label: `錯題本 (${Object.keys(progress.wrongAnswers).length})` },
      { id: 'stats', label: '統計' },
    ],
    [progress.wrongAnswers],
  )

  const currentQuestion = quizQueue[quizIndex]

  return (
    <div className="app-shell">
      <Header progress={progress} />

      {quizPhase !== 'active' && (
        <nav className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab ${view === tab.id ? 'active' : ''}`}
              onClick={() => {
                setView(tab.id)
                if (tab.id === 'practice') setQuizPhase('setup')
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {view === 'home' && quizPhase !== 'active' && (
        <HomeView
          progress={progress}
          totalQuestions={questions.length}
          onStartAll={() => {
            setView('practice')
            setQuizPhase('setup')
          }}
          onStartWrong={handleStartWrong}
        />
      )}

      {view === 'practice' && quizPhase === 'setup' && (
        <PracticeSetup
          questions={questions}
          progress={progress}
          filter={filter}
          onFilterChange={setFilter}
          onStart={() => startPractice()}
        />
      )}

      {view === 'practice' && quizPhase === 'active' && currentQuestion && (
        <QuizView
          question={currentQuestion}
          index={quizIndex}
          total={quizQueue.length}
          sessionCorrect={sessionCorrect}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onExit={handleExitQuiz}
        />
      )}

      {view === 'practice' && quizPhase === 'done' && (
        <div className="card empty-state">
          <div className="emoji">🏆</div>
          <h2 style={{ margin: '0 0 0.5rem' }}>本輪練習完成！</h2>
          <p>
            答對 {sessionCorrect} / {quizQueue.length} 題
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={() => setQuizPhase('setup')}>
              再練一輪
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleExitQuiz}>
              回首頁
            </button>
          </div>
        </div>
      )}

      {view === 'review' && (
        <ReviewView
          questions={questions}
          progress={progress}
          onPracticeWrong={handlePracticeWrongCategory}
        />
      )}

      {view === 'stats' && (
        <StatsView
          questions={questions}
          progress={progress}
          onPracticeCategory={(categoryId) => {
            setFilter({ mode: 'category', categoryId })
            setView('practice')
            startPractice({ mode: 'category', categoryId })
          }}
          onReset={() => {
            if (confirm('確定要重置所有進度與錯題記錄？')) {
              resetProgress()
              setProgress(defaultProgress())
              setQuizPhase('setup')
              setView('home')
            }
          }}
        />
      )}
    </div>
  )
}
