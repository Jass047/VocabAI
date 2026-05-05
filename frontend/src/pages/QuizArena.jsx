import { useState, useEffect, useRef } from 'react'
import { Trophy, Clock, CheckCircle, XCircle, ArrowRight, RotateCw, Zap } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const TYPES = ['mixed', 'mcq', 'fill_blank']

export default function QuizArena() {
  const [screen, setScreen] = useState('setup') // setup, playing, results
  const [difficulty, setDifficulty] = useState('medium')
  const [quizType, setQuizType] = useState('mixed')
  const [useWordBank, setUseWordBank] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [fillAnswer, setFillAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [results, setResults] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (screen === 'playing') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [screen])

  async function startQuiz() {
    setLoading(true)
    try {
      const res = await api.post('/api/quiz/generate', {
        count: 5, difficulty, quiz_type: quizType, use_word_bank: useWordBank
      })
      const qs = res.data.data.questions
      if (!qs || qs.length === 0) throw new Error('No questions generated')
      setQuestions(qs)
      setAnswers([])
      setCurrentQ(0)
      setTimer(0)
      setScreen('playing')
    } catch (err) {
      toast.error('Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleAnswer() {
    const q = questions[currentQ]
    const userAns = q.type === 'fill_blank' ? fillAnswer.trim() : selectedOption
    const isCorrect = userAns?.toLowerCase() === q.correct_answer?.toLowerCase()

    const answer = {
      question: q.question,
      question_type: q.type,
      user_answer: userAns || '',
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      explanation: q.explanation || ''
    }
    setAnswers([...answers, answer])
    setShowAnswer(true)
  }

  async function nextQuestion() {
    setShowAnswer(false)
    setSelectedOption(null)
    setFillAnswer('')

    if (currentQ + 1 >= questions.length) {
      clearInterval(timerRef.current)
      const finalAnswers = [...answers]
      // submit results
      try {
        const res = await api.post('/api/quiz/submit', {
          quiz_type: quizType,
          difficulty,
          time_taken: timer,
          answers: finalAnswers
        })
        setResults(res.data.data)
      } catch (err) {
        console.error('Submit error:', err)
      }
      setScreen('results')
    } else {
      setCurrentQ(currentQ + 1)
    }
  }

  function formatTime(s) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  // ─── SETUP SCREEN ───
  if (screen === 'setup') {
    return (
      <div className="page-enter space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Quiz Arena</h1>
          <p className="text-[var(--text-secondary)] mt-1">Test your vocabulary knowledge with AI-generated questions.</p>
        </div>

        <div className="card p-6 space-y-6 max-w-xl">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg border capitalize transition-all ${
                    difficulty === d ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">Question Type</label>
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button key={t} onClick={() => setQuizType(t)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg border capitalize transition-all ${
                    quizType === t ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                  }`}>
                  {t === 'fill_blank' ? 'Fill Blank' : t === 'mcq' ? 'MCQ' : 'Mixed'}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={useWordBank} onChange={(e) => setUseWordBank(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-color)] text-brand-500 focus:ring-brand-500" />
            <span className="text-sm text-[var(--text-secondary)]">Use words from my word bank</span>
          </label>

          <button onClick={startQuiz} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading ? <div className="spinner" style={{ width: 18, height: 18, borderColor: '#fff', borderTopColor: 'transparent' }} /> : <Zap size={18} />}
            {loading ? 'Generating Quiz...' : 'Start Quiz'}
          </button>
        </div>
      </div>
    )
  }

  // ─── PLAYING SCREEN ───
  if (screen === 'playing') {
    const q = questions[currentQ]
    return (
      <div className="page-enter space-y-6 max-w-2xl mx-auto">
        {/* progress bar */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Question {currentQ + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Clock size={15} />
            {formatTime(timer)}
          </div>
        </div>
        <div className="w-full h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>

        {/* question card */}
        <div className="card p-6">
          <span className={`badge mb-3 ${q.type === 'mcq' ? 'badge-info' : 'badge-warning'}`}>
            {q.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'}
          </span>
          <h2 className="text-lg font-medium text-[var(--text-primary)] leading-relaxed mb-6">{q.question}</h2>

          {q.type === 'mcq' || q.type === 'match' ? (
            <div className="space-y-3">
              {q.options?.map((opt, i) => {
                let classes = 'quiz-option'
                if (showAnswer) {
                  if (opt.toLowerCase() === q.correct_answer?.toLowerCase()) classes += ' correct'
                  else if (opt === selectedOption) classes += ' wrong'
                } else if (opt === selectedOption) {
                  classes += ' selected'
                }
                return (
                  <button key={i} onClick={() => !showAnswer && setSelectedOption(opt)}
                    disabled={showAnswer} className={`${classes} w-full text-left flex items-center gap-3`}>
                    <span className="w-8 h-8 rounded-full border border-[var(--border-color)] flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{opt}</span>
                    {showAnswer && opt.toLowerCase() === q.correct_answer?.toLowerCase() && (
                      <CheckCircle size={18} className="ml-auto text-emerald-500" />
                    )}
                    {showAnswer && opt === selectedOption && opt.toLowerCase() !== q.correct_answer?.toLowerCase() && (
                      <XCircle size={18} className="ml-auto text-red-500" />
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <input
              value={fillAnswer}
              onChange={(e) => setFillAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="input-field text-lg"
              disabled={showAnswer}
              onKeyDown={(e) => e.key === 'Enter' && !showAnswer && handleAnswer()}
            />
          )}

          {/* explanation */}
          {showAnswer && q.explanation && (
            <div className="mt-4 px-4 py-3 bg-[var(--surface-2)] rounded-lg">
              <p className="text-sm text-[var(--text-secondary)]">
                <span className="font-medium">Explanation: </span>{q.explanation}
              </p>
            </div>
          )}
        </div>

        {/* action button */}
        {!showAnswer ? (
          <button onClick={handleAnswer}
            disabled={q.type === 'fill_blank' ? !fillAnswer.trim() : !selectedOption}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            Check Answer
          </button>
        ) : (
          <button onClick={nextQuestion} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    )
  }

  // ─── RESULTS SCREEN ───
  if (screen === 'results') {
    const score = answers.filter(a => a.is_correct).length
    const total = answers.length
    const pct = Math.round((score / total) * 100)

    return (
      <div className="page-enter space-y-6 max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            pct >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20' : pct >= 50 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <Trophy size={36} className={pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-red-500'} />
          </div>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
            {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!'}
          </h2>
          <p className="stat-number text-4xl">{score}/{total}</p>
          <p className="text-[var(--text-secondary)] mt-1">{pct}% correct in {formatTime(timer)}</p>
        </div>

        {/* answer review */}
        <div className="space-y-3">
          {answers.map((a, i) => (
            <div key={i} className={`card p-4 border-l-4 ${a.is_correct ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
              <div className="flex items-start gap-3">
                {a.is_correct ? <CheckCircle size={18} className="text-emerald-500 mt-0.5" /> : <XCircle size={18} className="text-red-500 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-primary)] mb-1">{a.question}</p>
                  {!a.is_correct && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      Your answer: <span className="text-red-500">{a.user_answer}</span> &nbsp;•&nbsp;
                      Correct: <span className="text-emerald-500">{a.correct_answer}</span>
                    </p>
                  )}
                  {a.explanation && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{a.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setScreen('setup'); setResults(null); setAnswers([]) }} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <RotateCw size={16} /> New Quiz
          </button>
        </div>
      </div>
    )
  }
}
