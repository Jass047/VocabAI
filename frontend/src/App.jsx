import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import VocabEnhancer from './pages/VocabEnhancer'
import WordExplorer from './pages/WordExplorer'
import QuizArena from './pages/QuizArena'
import WordBankPage from './pages/WordBankPage'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--surface-1)]">
        <div className="spinner" />
      </div>
    )
  }
  return user ? children : <Navigate to="/" />
}

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[var(--surface-1)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--surface-0)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          fontSize: '14px'
        }
      }} />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/enhance" element={<ProtectedRoute><AppLayout><VocabEnhancer /></AppLayout></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><AppLayout><WordExplorer /></AppLayout></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><AppLayout><QuizArena /></AppLayout></ProtectedRoute>} />
        <Route path="/wordbank" element={<ProtectedRoute><AppLayout><WordBankPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      </Routes>
    </>
  )
}
