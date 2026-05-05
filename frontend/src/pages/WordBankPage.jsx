import { useState, useEffect } from 'react'
import { BookOpen, Download, Trash2, Filter, Search } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'

export default function WordBankPage() {
  const [words, setWords] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', difficulty: '' })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { loadWords(); loadStats() }, [filter])

  async function loadWords() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.difficulty) params.append('difficulty', filter.difficulty)
      const res = await api.get(`/api/wordbank/?${params}`)
      setWords(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const res = await api.get('/api/wordbank/stats')
      setStats(res.data.data)
    } catch (err) { console.error(err) }
  }

  async function deleteWord(id) {
    try {
      await api.delete(`/api/wordbank/${id}`)
      toast.success('Word removed')
      loadWords()
      loadStats()
    } catch (err) {
      toast.error('Failed to remove word')
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/api/wordbank/${id}`, { status })
      loadWords()
      loadStats()
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  async function exportPDF() {
    try {
      const res = await api.get('/api/wordbank/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'my_vocabulary.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF downloaded!')
    } catch (err) {
      toast.error('Export failed')
    }
  }

  const filtered = words.filter(w =>
    w.word.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Word Bank</h1>
          <p className="text-[var(--text-secondary)] mt-1">Your personal vocabulary collection.</p>
        </div>
        <button onClick={exportPDF} className="btn-secondary flex items-center gap-2 text-sm" disabled={words.length === 0}>
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-brand-500' },
            { label: 'New', value: stats.new, color: 'text-blue-500' },
            { label: 'Learning', value: stats.learning, color: 'text-amber-500' },
            { label: 'Mastered', value: stats.mastered, color: 'text-emerald-500' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search words..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="input-field py-2 text-sm w-auto">
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="learning">Learning</option>
          <option value="mastered">Mastered</option>
        </select>
        <select value={filter.difficulty} onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
          className="input-field py-2 text-sm w-auto">
          <option value="">All Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* word list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="loading-pulse h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen size={48} className="mx-auto text-[var(--text-tertiary)] mb-4 opacity-40" />
          <p className="text-[var(--text-tertiary)]">
            {words.length === 0 ? 'No words saved yet. Explore words to add them here!' : 'No words match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(w => (
            <div key={w.id} className="card p-5 hover:border-[var(--text-tertiary)]/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display font-semibold text-[var(--text-primary)] capitalize">{w.word}</span>
                    <span className={`badge ${w.difficulty === 'easy' ? 'badge-success' : w.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                      {w.difficulty}
                    </span>
                    <span className={`badge ${w.status === 'mastered' ? 'badge-success' : w.status === 'learning' ? 'badge-info' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}>
                      {w.status}
                    </span>
                    {w.accuracy > 0 && (
                      <span className="text-xs text-[var(--text-tertiary)]">{w.accuracy}% accuracy</span>
                    )}
                  </div>
                  {w.definition && <p className="text-sm text-[var(--text-secondary)] mb-1">{w.definition}</p>}
                  {w.synonyms && <p className="text-xs text-[var(--text-tertiary)]">Synonyms: {w.synonyms}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {w.status !== 'mastered' && (
                    <button onClick={() => updateStatus(w.id, 'mastered')}
                      className="btn-ghost p-2 text-emerald-500 text-xs rounded-lg" title="Mark as mastered">
                      ✓
                    </button>
                  )}
                  <button onClick={() => deleteWord(w.id)}
                    className="btn-ghost p-2 text-red-400 rounded-lg" title="Remove">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
