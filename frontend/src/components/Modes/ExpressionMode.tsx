import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useResearchStore } from '../../store/researchStore'
import { generateDraft } from '../../services/api'

function ExpressionMode() {
  const draft = useResearchStore((state) => state.draft)
  const papers = useResearchStore((state) => state.papers)
  const insights = useResearchStore((state) => state.insights)
  const idea = useResearchStore((state) => state.idea)
  const setDraft = useResearchStore((state) => state.setDraft)
  const setStage = useResearchStore((state) => state.setStage)
  const setLoading = useResearchStore((state) => state.setLoading)
  const isLoading = useResearchStore((state) => state.isLoading)
  const selectNode = useResearchStore((state) => state.selectNode)

  const [editingSection, setEditingSection] = useState<number | null>(null)
  const [showCitations, setShowCitations] = useState(false)
  const [editTitle, setEditTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')

  const handleGenerateDraft = async () => {
    if (!idea || isLoading) return
    setLoading(true)

    try {
      const result = await generateDraft(idea, papers.slice(0, 8), insights)

      setDraft(result)
      setStage('express')
    } catch (err) {
      console.error('Draft generation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTitle = () => {
    if (draft && titleValue.trim()) {
      setDraft({ ...draft, title: titleValue.trim() })
    }
    setEditTitle(false)
  }

  const handleSaveSection = (index: number, content: string) => {
    if (!draft) return
    const updatedSections = [...draft.sections]
    updatedSections[index] = { ...updatedSections[index], content }
    setDraft({ ...draft, sections: updatedSections })
    setEditingSection(null)
  }

  const handleDownloadMarkdown = () => {
    if (!draft) return

    let markdown = `# ${draft.title}\n\n`

    draft.sections.forEach((section) => {
      markdown += `## ${section.heading}\n\n${section.content}\n\n`
    })

    if (draft.citations.length > 0) {
      markdown += `## References\n\n`
      draft.citations.forEach((citation, i) => {
        markdown += `[${i + 1}] ${citation.title}\n`
      })
    }

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${draft.title.replace(/\s+/g, '_').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleStartOver = () => {
    setDraft(null)
    setStage('idle')
    selectNode(null)
  }

  if (!draft) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-900/30 border border-emerald-700/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📝</span>
          </div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">Ready to Write</h3>
          <p className="text-xs text-gray-500 max-w-[250px]">
            Your research idea has been refined. Generate a structured draft to begin writing.
          </p>
          <button
            onClick={handleGenerateDraft}
            disabled={isLoading}
            className="mt-4 px-4 py-2 text-xs font-medium text-emerald-300 bg-emerald-900/20 border border-emerald-700/30 rounded-lg hover:bg-emerald-900/40 disabled:opacity-40 transition-all"
          >
            {isLoading ? 'Generating...' : 'Generate Draft'}
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Title */}
      <div className="flex items-start justify-between">
        {editTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            autoFocus
            className="flex-1 bg-dark-800/50 border border-brain-600/50 rounded px-2 py-1 text-sm text-gray-100 outline-none"
          />
        ) : (
          <h3
            onClick={() => {
              setTitleValue(draft.title)
              setEditTitle(true)
            }}
            className="text-sm font-semibold text-gray-100 leading-snug cursor-pointer hover:text-brain-300 transition-colors flex-1"
            title="Click to edit title"
          >
            {draft.title}
          </h3>
        )}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button
            onClick={() => setShowCitations(!showCitations)}
            className={`p-1.5 rounded transition-colors ${showCitations ? 'bg-brain-900/50 text-brain-400' : 'text-gray-500 hover:text-gray-300'}`}
            title="Toggle citations"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="p-1.5 rounded text-gray-500 hover:text-gray-300 transition-colors"
            title="Download as Markdown"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Citations Panel */}
      <AnimatePresence>
        {showCitations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/30">
              <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                Citations ({draft.citations.length + papers.length})
              </h4>
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto scrollbar-thin">
                {papers.slice(0, 10).map((paper, i) => (
                  <button
                    key={paper.id}
                    onClick={() => selectNode(paper.id)}
                    className="w-full text-left p-2 rounded bg-dark-700/30 hover:bg-dark-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-brain-400 font-mono">[{i + 1}]</span>
                      <span className="text-[10px] text-gray-300 line-clamp-1 group-hover:text-gray-100">{paper.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sections */}
      <div className="space-y-4">
        {draft.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-brain-300 uppercase tracking-wider">
                {section.heading}
              </h4>
              <button
                onClick={() => setEditingSection(editingSection === i ? null : i)}
                className="opacity-0 group-hover:opacity-100 px-2 py-0.5 text-[10px] text-gray-400 hover:text-gray-200 border border-dark-600/50 rounded transition-all"
              >
                {editingSection === i ? 'Preview' : 'Edit'}
              </button>
            </div>

            {editingSection === i ? (
              <textarea
                defaultValue={section.content}
                onBlur={(e) => handleSaveSection(i, e.target.value)}
                className="w-full h-40 bg-dark-800/50 border border-brain-600/50 rounded-lg p-3 text-xs text-gray-200 font-mono leading-relaxed outline-none resize-y scrollbar-thin"
                autoFocus
              />
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-xs text-gray-300 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      strong: ({ children }) => <strong className="text-gray-100">{children}</strong>,
                      em: ({ children }) => <em className="text-gray-400">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-300">{children}</li>,
                      h1: ({ children }) => <h1 className="text-sm font-bold text-gray-100 mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xs font-semibold text-gray-200 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-[11px] font-medium text-gray-300 mb-1">{children}</h3>,
                      code: ({ children }) => <code className="bg-dark-700/50 px-1 py-0.5 rounded text-[10px] font-mono">{children}</code>,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-brain-600/30 pl-3 text-gray-400 italic">{children}</blockquote>,
                    }}
                  >
                    {section.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-dark-700/30 flex gap-2">
        <button
          onClick={handleStartOver}
          className="flex-1 px-4 py-2.5 text-xs font-medium text-gray-400 bg-dark-800/30 border border-dark-700/30 rounded-lg hover:bg-dark-800/50 transition-all"
        >
          Start Over
        </button>
      </div>
    </motion.div>
  )
}

export default ExpressionMode
