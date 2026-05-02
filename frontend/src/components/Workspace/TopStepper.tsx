import { motion } from 'framer-motion'
import { useResearchStore } from '../../store/researchStore'
import type { ResearchStage } from '../../types'

const stages: { key: ResearchStage; label: string; icon: string }[] = [
  { key: 'explore', label: 'Explore', icon: '🔍' },
  { key: 'understand', label: 'Understand', icon: '💡' },
  { key: 'create', label: 'Create', icon: '✨' },
  { key: 'refine', label: 'Refine', icon: '🛡️' },
]

const stageOrder = stages.map((s) => s.key)

function TopStepper() {
  const stage = useResearchStore((state) => state.stage)
  const setStage = useResearchStore((state) => state.setStage)
  const topic = useResearchStore((state) => state.topic)
  const currentIndex = stageOrder.indexOf(stage)
  const papers = useResearchStore((state) => state.papers)
  const insights = useResearchStore((state) => state.insights)

  if (stage === 'idle') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center pt-4"
    >
      <div className="glass rounded-full px-6 py-2.5 flex items-center gap-4 shadow-lg shadow-black/20">
        {topic && (
          <div className="flex items-center gap-2 mr-2 px-3 py-1 bg-dark-800/50 rounded-full">
            <svg className="w-3.5 h-3.5 text-brain-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs text-gray-300 truncate max-w-[120px]">{topic}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {stages.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <motion.button
                onClick={() => {
                  if (i <= currentIndex) setStage(s.key)
                }}
                className={`
                  relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all
                  ${i < currentIndex
                    ? 'text-brain-300 bg-brain-900/40 border border-brain-700/30'
                    : i === currentIndex
                      ? 'text-white bg-gradient-to-r from-brain-600 to-brain-500 shadow-lg shadow-brain-600/30'
                      : 'text-gray-600 cursor-not-allowed'
                  }
                `}
                whileHover={i <= currentIndex ? { scale: 1.05 } : {}}
                whileTap={i <= currentIndex ? { scale: 0.95 } : {}}
              >
                <span className="text-[11px]">{s.icon}</span>
                <span className="hidden md:inline">{s.label}</span>

                {i === currentIndex && (
                  <motion.div
                    layoutId="activeStage"
                    className="absolute inset-0 rounded-full bg-brain-600/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>

              {i < stages.length - 1 && (
                <div className={`w-6 h-[2px] mx-1 ${i < currentIndex ? 'bg-brain-500/50' : 'bg-gray-700/50'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-dark-700/50">
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{papers.length}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.5 3.5 0 1112 18.5l.548-.547a3.5 3.5 0 010-4.708z" />
            </svg>
            <span>{insights.length}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TopStepper
