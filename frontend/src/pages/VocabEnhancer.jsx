import { useState } from 'react'
import { Sparkles, Copy, RefreshCw, ArrowRight } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'

const TONES = ['academic', 'formal', 'casual', 'creative', 'professional']

export default function VocabEnhancer() {
  const [text, setText] = useState('')
  const [tone, setTone] = useState('academic')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('enhance') // enhance or rewrite

  async function handleSubmit() {
    if (!text.trim()) return toast.error('Please enter some text')
    setLoading(true)
    setResult(null)
    try {
      const endpoint = mode === 'enhance' ? '/api/vocab/enhance' : '/api/vocab/rewrite'
      const res = await api.post(endpoint, { text, tone })
      setResult(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(content) {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          {mode === 'enhance' ? 'Vocabulary Enhancer' : 'Text Rewriter'}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {mode === 'enhance'
            ? 'Paste your text to get AI-powered vocabulary suggestions and analysis.'
            : 'Rewrite your text in a different tone while keeping the meaning.'}
        </p>
      </div>

      {/* mode toggle */}
      <div className="flex gap-2 p-1 bg-[var(--surface-2)] rounded-lg w-fit">
        <button
          onClick={() => { setMode('enhance'); setResult(null) }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'enhance' ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}
        >
          Enhance
        </button>
        <button
          onClick={() => { setMode('rewrite'); setResult(null) }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'rewrite' ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}
        >
          Rewrite
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* input panel */}
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            className="textarea-field h-64 text-[15px] leading-relaxed"
          />

          {/* tone selector */}
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-all capitalize ${
                    tone === t
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !text.trim()} className="btn-primary flex items-center gap-2">
            {loading ? <div className="spinner" style={{ width: 18, height: 18, borderColor: '#fff', borderTopColor: 'transparent' }} /> : <Sparkles size={16} />}
            {loading ? 'Analyzing...' : mode === 'enhance' ? 'Enhance Text' : 'Rewrite Text'}
          </button>
        </div>

        {/* result panel */}
        <div className="space-y-4">
          {loading && (
            <div className="card p-8 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="spinner mx-auto mb-3" />
                <p className="text-sm text-[var(--text-tertiary)]">AI is analyzing your text...</p>
              </div>
            </div>
          )}

          {result && mode === 'enhance' && (
            <>
              {/* stats row */}
              <div className="flex gap-3 flex-wrap">
                <div className="card px-4 py-2.5 flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">Readability</span>
                  <span className="text-sm font-semibold text-brand-500">{result.readability_score}/100</span>
                </div>
                <div className="card px-4 py-2.5 flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">Level</span>
                  <span className={`badge ${result.vocabulary_level === 'basic' ? 'badge-success' : result.vocabulary_level === 'advanced' ? 'badge-danger' : 'badge-warning'}`}>
                    {result.vocabulary_level}
                  </span>
                </div>
                <div className="card px-4 py-2.5 flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">Words</span>
                  <span className="text-sm font-semibold">{result.word_count}</span>
                </div>
              </div>

              {/* enhanced text */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">Enhanced Version</h3>
                  <button onClick={() => copyToClipboard(result.enhanced_text)} className="btn-ghost p-1.5 rounded-lg">
                    <Copy size={15} />
                  </button>
                </div>
                <p className="text-[var(--text-primary)] text-[15px] leading-relaxed">{result.enhanced_text}</p>
              </div>

              {/* suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Suggestions</h3>
                  <div className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-[var(--text-tertiary)] line-through whitespace-nowrap">{s.original}</span>
                        <ArrowRight size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-brand-600 dark:text-brand-400">{s.suggestion}</span>
                          <span className="text-[var(--text-tertiary)] ml-2">— {s.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {result && mode === 'rewrite' && (
            <>
              <div className="flex gap-3 flex-wrap">
                <div className="card px-4 py-2.5">
                  <span className="text-xs text-[var(--text-tertiary)]">Before: </span>
                  <span className={`badge ${result.word_level_before === 'basic' ? 'badge-success' : 'badge-warning'}`}>{result.word_level_before}</span>
                </div>
                <div className="card px-4 py-2.5">
                  <span className="text-xs text-[var(--text-tertiary)]">After: </span>
                  <span className={`badge ${result.word_level_after === 'advanced' ? 'badge-danger' : 'badge-info'}`}>{result.word_level_after}</span>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">Rewritten ({tone})</h3>
                  <button onClick={() => copyToClipboard(result.rewritten_text)} className="btn-ghost p-1.5 rounded-lg">
                    <Copy size={15} />
                  </button>
                </div>
                <p className="text-[var(--text-primary)] text-[15px] leading-relaxed">{result.rewritten_text}</p>
              </div>

              {result.changes_made?.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Changes Made</h3>
                  <ul className="space-y-1.5">
                    {result.changes_made.map((c, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-brand-500 mt-1">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
