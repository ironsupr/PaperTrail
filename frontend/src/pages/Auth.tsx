import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HiSparkles, HiMail, HiLockClosed, HiUser } from 'react-icons/hi'
import { useResearchStore } from '../store/researchStore'
import { login as apiLogin, register as apiRegister } from '../services/api'
import type { UserRole } from '../types'

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('researcher')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const loginStore = useResearchStore((state) => state.login)
  const setUserRole = useResearchStore((state) => state.setUserRole)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isLogin) {
        const data = await apiLogin(email, password)
        loginStore(data.access_token, data.user)
      } else {
        const data = await apiRegister(email, password, name, role)
        loginStore(data.access_token, data.user)
      }
      setUserRole(role)
      navigate('/role-select')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed')
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 selection:bg-indigo-500/30">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8 rounded-[2rem] shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
              <HiSparkles className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join PaperTrail'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin
                ? 'Sign in to continue your research journey.'
                : 'Create an account to start your intelligence trail.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 ml-1">FULL NAME</label>
                    <div className="relative group">
                      <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 ml-1">ROLE</label>
                    <div className="flex gap-2">
                      {(['researcher', 'student', 'reviewer'] as UserRole[]).map((r) => (
                        <button
                          type="button"
                          key={r}
                          onClick={() => setRole(r)}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                            role === r
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 ml-1">EMAIL ADDRESS</label>
              <div className="relative group">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 ml-1">PASSWORD</label>
              <div className="relative group">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] mt-4"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Auth
