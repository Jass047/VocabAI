import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Sparkles, Search, Trophy,
  BookOpen, User, LogOut, Moon, Sun, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/enhance', icon: Sparkles, label: 'Enhance Text' },
  { to: '/explore', icon: Search, label: 'Word Explorer' },
  { to: '/quiz', icon: Trophy, label: 'Quiz Arena' },
  { to: '/wordbank', icon: BookOpen, label: 'Word Bank' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout, darkMode, toggleTheme } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-[var(--text-primary)]">
            VocabAI
          </span>
        )}
      </div>

      {/* nav links */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
              }
              ${collapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* bottom section */}
      <div className="px-3 pb-4 space-y-2 border-t border-[var(--border-color)] pt-4 mt-2">
        {/* theme toggle */}
        <button onClick={toggleTheme} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-2)] w-full transition-all ${collapsed ? 'justify-center' : ''}`}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* user info */}
        {user && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--text-tertiary)] truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* logout */}
        <button onClick={handleLogout} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all ${collapsed ? 'justify-center' : ''}`}>
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--surface-0)] border border-[var(--border-color)]"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* desktop sidebar */}
      <aside className={`hidden lg:flex flex-col h-screen bg-[var(--surface-0)] border-r border-[var(--border-color)] transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[var(--surface-0)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all"
          style={{ fontSize: '12px' }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </aside>

      {/* mobile sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-[260px] bg-[var(--surface-0)] border-r border-[var(--border-color)] z-40 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  )
}
