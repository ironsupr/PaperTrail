import { motion } from 'framer-motion'
import { useResearchStore } from '../../store/researchStore'

function CreationMode() {
  const idea = useResearchStore((state) => state.idea)
  const stage = useResearchStore((state) => state.stage)
  const setStage = useResearchStore((state) => state.setStage)

  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-700/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">✨</span>
          </div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">Ready to Create</h3>
          <p className="text-xs text-gray-500">
            Click "Generate Idea" in the bottom bar to create a novel research idea from your exploration.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-semibold text-gray-100 leading-snug"
        >
          {idea.title}
        </motion.h3>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/30"
      >
        <p className="text-xs text-gray-300 leading-relaxed">{idea.abstract}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Contributions</h4>
        <div className="space-y-1.5">
          {idea.contributions.map((contrib, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brain-400 mt-1.5 shrink-0" />
              <p className="text-xs text-gray-300">{contrib}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Method Direction</h4>
        <p className="text-xs text-gray-300 leading-relaxed">{idea.methodDirection}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/30"
      >
        <h4 className="text-xs font-medium text-purple-300 mb-1">Research Gap Addressed</h4>
        <p className="text-xs text-purple-200/70 leading-relaxed">{idea.researchGap}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pt-2"
      >
        <button
          onClick={() => setStage('refine')}
          className="w-full px-4 py-2.5 text-xs font-medium text-amber-300 bg-amber-900/20 border border-amber-700/30 rounded-lg hover:bg-amber-900/40 transition-all flex items-center justify-center gap-2"
        >
          <span>🛡️</span>
          Validate Novelty
        </button>
      </motion.div>
    </motion.div>
  )
}

export default CreationMode
