import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HiArrowRight, HiSparkles, HiLink, HiChartBar } from 'react-icons/hi'

const Home: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <HiSparkles className="text-white text-xl" />
          </div>
          <span className="text-xl font-bold tracking-tight">PaperTrail <span className="text-indigo-400">OS</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/auth')}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-widest uppercase border border-indigo-500/20">
              Introducing PaperTrail 1.0
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight"
          >
            Your Research, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400">Reimagined.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Unlock continuous research intelligence. PaperTrail OS helps you explore citation networks, generate narratives from literature, and validate your novel ideas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/30 group"
            >
              Start Your Journey
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all">
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32">
          {[
            {
              title: 'Semantic Discovery',
              description: 'Go beyond keywords. Explore papers through deep semantic meaning and citation relationships.',
              icon: <HiSparkles className="text-2xl text-indigo-400" />,
            },
            {
              title: 'Citation Graph',
              description: 'Visualize the evolution of a field with dynamic, interactive node-link diagrams of literature.',
              icon: <HiLink className="text-2xl text-blue-400" />,
            },
            {
              title: 'AI Narratives',
              description: 'Generate high-level summaries and "stories of the field" synthesized from dozens of papers.',
              icon: <HiChartBar className="text-2xl text-purple-400" />,
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              className="glass p-8 rounded-3xl space-y-4 group hover:bg-white/5 transition-all cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home
