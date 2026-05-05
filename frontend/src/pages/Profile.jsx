import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { User, Clock, Trophy, Sparkles, Calendar } from 'lucide-react'
import api from '../api'

export default function Profile() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [quizHistory, setQuizHistory] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [dashRes, quizRes, histRes] = await Promise.all([
        api.get('/api/user/dashboard'),
        api.get('/api/quiz/history'),
        api.get('/api/user/history')
      ])
      setDashboard(dashRes.data.data)
      setQuizHistory(quizRes.data.data)
      setSearchHistory(histRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-enter space-y-6">
        <div className="loading-pulse h-40 rounded-xl" />
        <div className="loading-pulse h-64 rounded-xl" />
      </div>
    )
  }

  const stats = dashboard?.stats || {}

  return (
    <div className="page-enter space-y-6">
      {/* user card */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <img src={user?.avatar_url} alt="" className="w-16 h-16 rounded-2xl" />
          <div>
            <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">{user?.name}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1">
              <Calendar size={12} /> Member since {dashboard?.user?.member_since}
            </p>
          </div>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Words Saved', value: stats.total_words, icon: Sparkles },
            { label: 'Words Mastered', value: stats.mastered_words, icon: User },
            { label: 'Quizzes Taken', value: stats.total_quizzes, icon: Trophy },
            { label: 'Avg Score', value: `${stats.avg_score}%`, icon: Clock },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface-2)] rounded-lg p-4 text-center">
              <p className="font-display text-xl font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-lg w-fit">
        {['overview', 'quiz history', 'activity'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
              activeTab === tab ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* tab content */}
      {activeTab === 'overview' && (
        <div className="card p-6">
          <h2 className="section-title mb-4">Quiz Score Trend</h2>
          {dashboard?.quiz_chart?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dashboard.quiz_chart}>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }} />
                <Bar dataKey="score" fill="#3366ff" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-[var(--text-tertiary)]">
              No quiz data yet
            </div>
          )}
        </div>
      )}

      {activeTab === 'quiz history' && (
        <div className="space-y-3">
          {quizHistory.length === 0 ? (
            <div className="card p-12 text-center text-[var(--text-tertiary)]">No quizzes taken yet</div>
          ) : quizHistory.map(q => (
            <div key={q.id} className="card p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg ${
                q.percentage >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                q.percentage >= 50 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                'bg-red-50 dark:bg-red-900/20 text-red-600'
              }`}>
                {q.percentage}%
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {q.quiz_type.toUpperCase()} Quiz — {q.difficulty}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {q.score}/{q.total_questions} correct • {Math.floor(q.time_taken / 60)}m {q.time_taken % 60}s
                </p>
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">
                {new Date(q.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-3">
          {searchHistory.length === 0 ? (
            <div className="card p-12 text-center text-[var(--text-tertiary)]">No activity yet</div>
          ) : searchHistory.map(h => (
            <div key={h.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center">
                <Clock size={16} className="text-[var(--text-tertiary)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="badge-info text-[10px]">{h.feature}</span>
                  <span className="text-sm text-[var(--text-primary)]">{h.query}</span>
                </div>
                {h.summary && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{h.summary}</p>}
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">
                {new Date(h.time).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
