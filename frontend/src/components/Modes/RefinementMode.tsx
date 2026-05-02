import { motion } from 'framer-motion'
import { useResearchStore } from '../../store/researchStore'

function RefinementMode() {
  const noveltyResult = useResearchStore((state) => state.noveltyResult)
  const idea = useResearchStore((state) => state.idea)
  const setStage = useResearchStore((state) => state.setStage)

  if (!noveltyResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-900/30 border border-amber-700/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">🛡️</span>
          </div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">Novelty Check</h3>
          <p className="text-xs text-gray-500">
            Generate an idea first, then click "Refine Idea" to validate its novelty.
          </p>
        </motion.div>
      </div>
    )
  }

  const riskColors = {
    Low: 'text-emerald-400',
    Medium: 'text-amber-400',
    High: 'text-red-400',
  }

  const riskBg = {
    Low: 'bg-emerald-900/20 border-emerald-700/30',
    Medium: 'bg-amber-900/20 border-amber-700/30',
    High: 'bg-red-900/20 border-red-700/30',
  }

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          System Feedback on Your Idea
        </h3>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border ${riskBg[noveltyResult.riskLevel]}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-300">Novelty Assessment</span>
          <span className={`text-xs font-bold ${riskColors[noveltyResult.riskLevel]}`}>
            {noveltyResult.riskLevel} Risk
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={`text-2xl font-bold ${scoreColor(noveltyResult.noveltyScore)}`}>
              {noveltyResult.noveltyScore}
            </div>
            <div className="text-[10px] text-gray-500">Novelty Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-200">
              {noveltyResult.rejectionProbability}%
            </div>
            <div className="text-[10px] text-gray-500">Rejection Risk</div>
          </div>
        </div>

        <div className="mt-3 h-1.5 bg-dark-800/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${noveltyResult.noveltyScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              noveltyResult.noveltyScore >= 70
                ? 'bg-emerald-500'
                : noveltyResult.noveltyScore >= 40
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            }`}
          />
        </div>
      </motion.div>

      {noveltyResult.similarPapers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Similar Papers ({noveltyResult.similarPapers.length})
          </h4>
          <div className="space-y-2 max-h-[150px] overflow-y-auto scrollbar-thin">
            {noveltyResult.similarPapers.map((paper, i) => (
              <div key={i} className="p-2 rounded bg-dark-800/30 border border-dark-700/20">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-gray-300 line-clamp-1">{paper.title}</p>
                  <span className="text-[10px] text-amber-400 font-medium ml-2">
                    {Math.round(paper.similarity * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {noveltyResult.reviewerFeedback && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-xs font-medium text-emerald-400 mb-2">Strengths</h4>
            <div className="space-y-1">
              {noveltyResult.reviewerFeedback.strengths?.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-gray-300">{s}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h4 className="text-xs font-medium text-red-400 mb-2">Weaknesses</h4>
            <div className="space-y-1">
              {noveltyResult.reviewerFeedback.weaknesses?.map((w: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-gray-300">{w}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-xs font-medium text-brain-400 mb-2">Suggestions</h4>
            <div className="space-y-1">
              {noveltyResult.reviewerFeedback.suggestions?.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brain-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-gray-300">{s}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {noveltyResult.noveltyScore >= 50 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="pt-2"
        >
          <button
            onClick={() => setStage('express')}
            className="w-full px-4 py-2.5 text-xs font-medium text-brain-300 bg-brain-900/20 border border-brain-700/30 rounded-lg hover:bg-brain-900/40 transition-all flex items-center justify-center gap-2"
          >
            <span>📝</span>
            Generate Draft
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default RefinementMode
