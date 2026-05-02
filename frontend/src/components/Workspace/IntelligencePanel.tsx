import { motion, AnimatePresence } from 'framer-motion'
import { useResearchStore } from '../../store/researchStore'
import ExplorationMode from '../Modes/ExplorationMode'
import UnderstandingMode from '../Modes/UnderstandingMode'
import CreationMode from '../Modes/CreationMode'
import RefinementMode from '../Modes/RefinementMode'
import ExpressionMode from '../Modes/ExpressionMode'
import NoveltyDashboard from './NoveltyDashboard'
import CitationVerificationPanel from './CitationVerificationPanel'

function IntelligencePanel() {
  const stage = useResearchStore((state) => state.stage)
  const selectedNodeId = useResearchStore((state) => state.selectedNodeId)
  const papers = useResearchStore((state) => state.papers)
  const insights = useResearchStore((state) => state.insights)
  const idea = useResearchStore((state) => state.idea)
  const userRole = useResearchStore((state) => state.userRole)
  const noveltyResult = useResearchStore((state) => state.noveltyResult)

  const renderMode = () => {
    // Show researcher-specific tools in relevant stages
    if (userRole === 'researcher') {
      if (stage === 'refine' && (idea || noveltyResult)) {
        return <NoveltyDashboard />
      }
      if (stage === 'express') {
        return (
          <div className="space-y-6">
            <CitationVerificationPanel />
            <ExpressionMode />
          </div>
        )
      }
    }

    switch (stage) {
      case 'idle':
        return <IdleState />
      case 'explore':
        return <ExplorationMode />
      case 'understand':
        return <UnderstandingMode />
      case 'create':
        return <CreationMode />
      case 'refine':
        return <RefinementMode />
      case 'express':
        return <ExpressionMode />
      default:
        return <ExplorationMode />
    }
  }

  const getStageIcon = () => {
    switch (stage) {
      case 'idle': return '🧠'
      case 'explore': return '🔍'
      case 'understand': return '💡'
      case 'create': return '✨'
      case 'refine': return '🛡️'
      case 'express': return '📝'
      default: return '🧠'
    }
  }

  return (
    <motion.div
      initial={false}
      className="absolute top-12 right-0 bottom-20 w-[420px] z-10"
    >
      <div className="h-full glass-strong rounded-l-2xl border-r-0 overflow-hidden flex flex-col shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="px-5 py-4 border-b border-dark-700/30 flex items-center justify-between shrink-0 bg-dark-800/30">
          <div className="flex items-center gap-2.5">
            <span className="text-base">{getStageIcon()}</span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-100">
                {stage === 'idle' && 'Ready'}
                {stage === 'explore' && 'Exploring'}
                {stage === 'understand' && 'Understanding'}
                {stage === 'create' && 'Creating'}
                {stage === 'refine' && 'Refining'}
                {stage === 'express' && 'Writing'}
              </span>
              {stage !== 'idle' && (
                <span className="text-[10px] text-gray-500">
                  {papers.length} papers
                  {insights.length > 0 && ` · ${insights.length} insights`}
                  {idea && ' · idea ready'}
                </span>
              )}
            </div>
          </div>
          {selectedNodeId && (
            <span className="text-[10px] px-2 py-0.5 bg-brain-900/30 text-brain-300 rounded-full">
              Node selected
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-5"
            >
              {renderMode()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        {stage !== 'idle' && (
          <div className="px-5 py-3 border-t border-dark-700/30 bg-dark-800/20 shrink-0">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5">
              <span>Progress</span>
              <span>
                {['explore', 'understand', 'create', 'refine', 'express'].indexOf(stage) + 1} / 5
              </span>
            </div>
            <div className="h-1 bg-dark-700/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brain-600 to-brain-400"
                initial={{ width: 0 }}
                animate={{
                  width: `${((['explore', 'understand', 'create', 'refine', 'express'].indexOf(stage) + 1) / 5) * 100}%`
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-brain-900/50 border border-brain-700/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🧠</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">PaperTrail OS</h3>
        <p className="text-sm text-gray-400 max-w-[280px]">
          Enter a research topic below to begin your intelligence journey.
        </p>
      </motion.div>
    </div>
  )
}

export default IntelligencePanel
