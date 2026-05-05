import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BookOpen, Trophy, Sparkles, Search, ArrowRight, Lightbulb, Clock } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'

const COLORS = ['#10b981', '#f59e0b', '#3366ff']

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [wordOfDay, setWordOfDay] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
    loadWordOfDay()
  }, [])

  async function loadDashboard() {
    try {
      const res = await api.get('/api/user/dashboard')
      setDashboard(res.data.data)
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadWordOfDay() {
    try {
      const res = await api.get('/api/vocab/word-of-day')
      setWordOfDay(res.data.data)
    } catch (err) {
      console.error('Word of day error:', err)
    }
  }

  if (loading) {
    return (
      <div className="page-enter space-y-6">
        <div className="loading-pulse h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="loading-pulse h-28 rounded-xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="loading-pulse h-64 rounded-xl" />
          <div className="loading-pulse h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  const stats = dashboard?.stats || {}
  const pieData = dashboard?.word_difficulty ? [
    { name: 'Easy', value: dashboard.word_difficulty.easy || 0 },
    { name: 'Medium', value: dashboard.word_difficulty.medium || 0 },
    { name: 'Hard', value: dashboard.word_difficulty.hard || 0 },
  ].filter(d => d.value > 0) : []

  const statCards = [
    { label: 'Words Saved', value: stats.total_words || 0, icon: BookOpen, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Mastered', value: stats.mastered_words || 0, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Quizzes Taken', value: stats.total_quizzes || 0, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Avg Score', value: `${stats.avg_score || 0}%`, icon: Search, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ]

  return (
    <div className="page-enter space-y-6">
      {/* greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Here's how your vocabulary journey is going.</p>
      </div>

      {/* stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--text-secondary)]">{s.label}</span>
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
            <p className="stat-number">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* quiz score chart */}
        <div className="lg:col-span-3 card p-6">
          <h2 className="section-title mb-4">Quiz Performance</h2>
          {dashboard?.quiz_chart?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dashboard.quiz_chart}>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }} />
                <Line type="monotone" dataKey="score" stroke="#3366ff" strokeWidth={2.5} dot={{ r: 4, fill: '#3366ff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[var(--text-tertiary)]">
              Take your first quiz to see your progress chart!
            </div>
          )}
        </div>

        {/* word difficulty pie */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="section-title mb-4">Word Difficulty</h2>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-[var(--text-tertiary)]">
              Save words to see difficulty breakdown
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* word of the day */}
        <div className="lg:col-span-3 card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-amber-500" />
            <h2 className="section-title">Word of the Day</h2>
          </div>
          {wordOfDay ? (
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
                  {wordOfDay.word}
                </span>
                <span className="text-sm text-[var(--text-tertiary)]">{wordOfDay.pronunciation}</span>
                <span className={`badge ${wordOfDay.difficulty === 'easy' ? 'badge-success' : wordOfDay.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                  {wordOfDay.difficulty}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] italic mb-1">{wordOfDay.part_of_speech}</p>
              <p className="text-[var(--text-primary)] mb-3">{wordOfDay.definition}</p>
              <p className="text-sm text-[var(--text-secondary)] bg-[var(--surface-2)] px-4 py-3 rounded-lg italic">
                "{wordOfDay.example}"
              </p>
              {wordOfDay.fun_fact && (
                <p className="text-xs text-[var(--text-tertiary)] mt-3">💡 {wordOfDay.fun_fact}</p>
              )}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <div className="spinner" />
            </div>
          )}
        </div>

        {/* quick actions */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="section-title px-1">Quick Actions</h2>
          {[
            { label: 'Enhance Text', desc: 'Improve your writing', to: '/enhance', icon: Sparkles },
            { label: 'Explore a Word', desc: 'Deep dive into vocabulary', to: '/explore', icon: Search },
            { label: 'Start a Quiz', desc: 'Test your knowledge', to: '/quiz', icon: Trophy },
          ].map(a => (
            <button key={a.to} onClick={() => navigate(a.to)} className="card-hover p-4 w-full flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
                <a.icon size={18} className="text-brand-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{a.label}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{a.desc}</p>
              </div>
              <ArrowRight size={16} className="text-[var(--text-tertiary)]" />
            </button>
          ))}
        </div>
      </div>

      {/* recent activity */}
      {dashboard?.recent_activity?.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {dashboard.recent_activity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center">
                  <Clock size={14} className="text-[var(--text-tertiary)]" />
                </div>
                <div className="flex-1">
                  <span className="badge-info text-[10px] mr-2">{a.feature}</span>
                  <span className="text-[var(--text-secondary)]">{a.query}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
