import { useState } from 'react'
import { Search, Plus, BookOpen, Volume2 } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'

export default function WordExplorer() {
  const [word, setWord] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSearch(e) {
    e?.preventDefault()
    if (!word.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/api/vocab/explore', { word: word.trim() })
      setResult(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to explore word')
    } finally {
      setLoading(false)
    }
  }

  async function saveToWordBank() {
    if (!result) return
    setSaving(true)
    try {
      await api.post('/api/wordbank/add', {
        word: result.word,
        definition: result.definition,
        example_sentence: result.examples?.[0] || '',
        synonyms: result.synonyms?.join(', ') || '',
        antonyms: result.antonyms?.join(', ') || '',
        difficulty: result.difficulty || 'medium'
      })
      toast.success(`"${result.word}" saved to word bank!`)
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error('Word already in your word bank')
      } else {
        toast.error('Failed to save word')
      }
    } finally {
      setSaving(false)
    }
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Word Explorer</h1>
        <p className="text-[var(--text-secondary)] mt-1">Search any word for AI-powered definitions, etymology, and more.</p>
      </div>

      {/* search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Type a word to explore..."
            className="input-field pl-11 text-lg"
          />
        </div>
        <button type="submit" disabled={loading || !word.trim()} className="btn-primary px-8">
          {loading ? <div className="spinner" style={{ width: 18, height: 18, borderColor: '#fff', borderTopColor: 'transparent' }} /> : 'Explore'}
        </button>
      </form>

      {/* loading */}
      {loading && (
        <div className="card p-12 text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm text-[var(--text-tertiary)]">Exploring "{word}"...</p>
        </div>
      )}

      {/* result */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          {/* word header */}
          <div className="card p-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-display text-3xl font-bold text-[var(--text-primary)] capitalize">{result.word}</h2>
                  <button onClick={() => speak(result.word)} className="btn-ghost p-2 rounded-full">
                    <Volume2 size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--text-tertiary)] font-mono">{result.pronunciation}</span>
                  <span className="text-[var(--text-secondary)] italic">{result.part_of_speech}</span>
                  <span className={`badge ${result.difficulty === 'easy' ? 'badge-success' : result.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                    {result.difficulty}
                  </span>
                </div>
              </div>
              <button onClick={saveToWordBank} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={16} />
                {saving ? 'Saving...' : 'Save to Word Bank'}
              </button>
            </div>

            <p className="text-[var(--text-primary)] text-lg mt-4 leading-relaxed">{result.definition}</p>

            {result.etymology && (
              <div className="mt-4 px-4 py-3 bg-[var(--surface-2)] rounded-lg">
                <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">Origin</span>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{result.etymology}</p>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* synonyms */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Synonyms</h3>
              <div className="flex flex-wrap gap-2">
                {result.synonyms?.map(s => (
                  <button key={s} onClick={() => { setWord(s); handleSearch() }}
                    className="px-3 py-1.5 text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:opacity-80 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* antonyms */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Antonyms</h3>
              <div className="flex flex-wrap gap-2">
                {result.antonyms?.map(a => (
                  <button key={a} onClick={() => { setWord(a); handleSearch() }}
                    className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:opacity-80 transition-all">
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* examples */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Example Sentences</h3>
            <div className="space-y-3">
              {result.examples?.map((ex, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-brand-500 font-mono font-bold mt-0.5">{i + 1}</span>
                  <p className="text-[var(--text-secondary)] leading-relaxed italic">{ex}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* related words */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Related Words</h3>
              <div className="flex flex-wrap gap-2">
                {result.related_words?.map(r => (
                  <button key={r} onClick={() => { setWord(r); handleSearch() }}
                    className="px-3 py-1.5 text-sm bg-[var(--surface-2)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--surface-3)] transition-all">
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* memory tip */}
            {result.memory_tip && (
              <div className="card p-5 bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">💡 Memory Tip</h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{result.memory_tip}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* empty state */}
      {!result && !loading && (
        <div className="card p-16 text-center">
          <BookOpen size={48} className="mx-auto text-[var(--text-tertiary)] mb-4 opacity-40" />
          <p className="text-[var(--text-tertiary)]">Search for a word to start exploring</p>
        </div>
      )}
    </div>
  )
}
