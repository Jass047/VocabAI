import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { Sparkles, BookOpen, Trophy, Search, ArrowRight, Zap, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const features = [
  { icon: Sparkles, title: 'AI Text Enhancement', desc: 'Elevate your writing with smarter vocabulary and tone adjustments.' },
  { icon: Search, title: 'Word Explorer', desc: 'Deep-dive into any word with AI-powered definitions, etymology, and usage.' },
  { icon: Trophy, title: 'Quiz Arena', desc: 'Test your knowledge with adaptive quizzes generated from your word bank.' },
  { icon: BookOpen, title: 'Personal Word Bank', desc: 'Save, track, and master words with spaced repetition.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { loginWithGoogle, darkMode, toggleTheme } = useAuth()
  const [loggingIn, setLoggingIn] = useState(false)

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setLoggingIn(true)
      const success = await loginWithGoogle(response.access_token)
      if (success) {
        toast.success('Welcome to VocabAI!')
        navigate('/dashboard')
      } else {
        toast.error('Login failed. Please try again.')
      }
      setLoggingIn(false)
    },
    onError: () => {
      toast.error('Google login failed')
    }
  })

  return (
    <div className="min-h-screen bg-[var(--surface-1)] relative overflow-hidden">
      {/* subtle background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      {/* nav */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-[var(--text-primary)]">VocabAI</span>
        </div>
        <button onClick={toggleTheme} className="btn-ghost p-2.5 rounded-xl">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-sm font-medium mb-6 animate-fade-in">
          <Zap size={14} />
          Powered by AI
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[var(--text-primary)] leading-tight mb-6 animate-slide-up">
          Master vocabulary
          <br />
          <span className="text-brand-500">with intelligence</span>
        </h1>

        <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Enhance your writing, explore words deeply, and test your knowledge — 
          all powered by AI that adapts to your learning pace.
        </p>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={googleLogin}
            disabled={loggingIn}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--surface-0)] font-semibold text-base rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loggingIn ? (
              <div className="spinner" style={{ width: '20px', height: '20px', borderColor: 'var(--surface-0)', borderTopColor: 'transparent' }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loggingIn ? 'Signing in...' : 'Continue with Google'}
            {!loggingIn && <ArrowRight size={18} />}
          </button>
        </div>
      </section>

      {/* features grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 pb-24">
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card p-6 animate-slide-up"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-brand-500" />
              </div>
              <h3 className="font-display font-semibold text-base text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[var(--text-tertiary)] mt-12">
          Built for INT428 — AI Essentials &nbsp;•&nbsp; Lovely Professional University
        </p>
      </section>
    </div>
  )
}
