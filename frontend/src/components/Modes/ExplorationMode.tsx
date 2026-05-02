import { motion } from 'framer-motion'
import { useResearchStore } from '../../store/researchStore'

function ExplorationMode() {
  const papers = useResearchStore((state) => state.papers)
  const storyOfField = useResearchStore((state) => state.storyOfField)
  const selectedPaper = useResearchStore((state) => state.getSelectedPaper())
  const selectNode = useResearchStore((state) => state.selectNode)
  const selectedNodeId = useResearchStore((state) => state.selectedNodeId)

  if (selectedPaper) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <button
          onClick={() => selectNode(null)}
          className="text-xs text-brain-400 hover:text-brain-300 transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all papers
        </button>

        <div>
          <h3 className="text-sm font-semibold text-gray-100 leading-snug">{selectedPaper.title}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedPaper.authors.slice(0, 3).join(', ')} · {selectedPaper.year}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/30">
          <p className="text-xs text-gray-300 leading-relaxed">{selectedPaper.abstract}</p>
        </div>

        {selectedPaper.keyConcepts && selectedPaper.keyConcepts.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">Key Concepts</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedPaper.keyConcepts.slice(0, 8).map((concept, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[10px] bg-brain-900/30 text-brain-300 rounded-md border border-brain-800/30"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Story of the Field</h3>
        {storyOfField ? (
          <p className="text-sm text-gray-300 leading-relaxed">{storyOfField}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">Generating narrative...</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Papers ({papers.length})
        </h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
          {papers.map((paper, i) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => selectNode(paper.id)}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all hover:border-brain-600/50
                ${selectedNodeId === paper.id
                  ? 'bg-brain-900/30 border-brain-500/50'
                  : 'bg-dark-800/30 border-dark-700/30 hover:bg-dark-800/50'
                }
              `}
            >
              <h4 className="text-xs font-medium text-gray-200 line-clamp-2 leading-snug">{paper.title}</h4>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-gray-500">{paper.year}</span>
                <span className="text-[10px] text-gray-500">·</span>
                <span className="text-[10px] text-gray-500">{paper.authors.length} authors</span>
              </div>
              {paper.keyConcepts && paper.keyConcepts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {paper.keyConcepts.slice(0, 3).map((c, j) => (
                    <span key={j} className="text-[9px] px-1.5 py-0.5 bg-dark-700/50 text-gray-400 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExplorationMode
