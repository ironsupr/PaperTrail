import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useResearchStore } from '../../store/researchStore'

function PaperSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const papers = useResearchStore((state) => state.papers)
  const selectedNodeId = useResearchStore((state) => state.selectedNodeId)
  const selectNode = useResearchStore((state) => state.selectNode)
  const stage = useResearchStore((state) => state.stage)
  const topic = useResearchStore((state) => state.topic)

  return (
    <>
      <motion.div
        initial={false}
        className="absolute top-12 left-0 bottom-20 z-20"
        animate={{ width: isCollapsed ? 0 : 320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className={`h-full glass-strong rounded-r-2xl border-l-0 overflow-hidden flex flex-col ${isCollapsed ? 'w-0' : 'w-[320px]'}`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-dark-700/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brain-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253m0 13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs font-medium text-gray-200">Papers</span>
              <span className="text-[10px] text-gray-500">({papers.length})</span>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-dark-700/50 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l7-7-7-7" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {papers.length === 0 ? (
              <div className="p-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-dark-800/50 border border-dark-700/30 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.875 1.875 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a3.375 3.375 0 00-3.375-3.375z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">
                  {stage === 'idle' ? 'Search a topic to see papers' : 'No papers loaded yet'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {papers.map((paper, i) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => selectNode(paper.id)}
                    className={`
                      p-2.5 rounded-lg border cursor-pointer transition-all duration-200;
                      ${selectedNodeId === paper.id
                        ? 'bg-brain-900/30 border-brain-500/50 shadow-[0_0_15px_rgba(92,124,250,0.2)]'
                        : 'bg-dark-800/30 border-dark-700/30 hover:bg-dark-800/50 hover:border-dark-600/50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-medium text-gray-200 line-clamp-2 leading-snug flex-1">
                        {paper.title}
                      </h4>
                      {paper.url && (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 p-1 rounded hover:bg-dark-700/50 transition-colors"
                          title="Open in Semantic Scholar"
                        >
                          <svg className="w-3 h-3 text-gray-500 hover:text-brain-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>{paper.year}</span>
                      <span>·</span>
                      <span className="truncate">{paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 ? ' et al.' : ''}</span>
                      {paper.keyConcepts && paper.keyConcepts.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-brain-400">{paper.keyConcepts[0]}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Topic filter */}
          {topic && (
            <div className="px-4 py-2 border-t border-dark-700/30 shrink-0">
              <p className="text-[10px] text-gray-500 truncate">
                Topic: <span className="text-gray-400">{topic}</span>
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Toggle button when collapsed */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsCollapsed(false)}
            className="absolute top-1/2 left-0 z-30 p-2 bg-dark-800/90 border border-dark-700/50 rounded-r-lg hover:bg-dark-700/90 transition-all hover:shadow-lg"
            title="Show papers"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default PaperSidebar
