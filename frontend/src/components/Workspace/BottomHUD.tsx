import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useResearchStore } from '../../store/researchStore'
import { searchPapers, parsePDF, generateIdea, validateNovelty, generateDraft, analyzeGraph } from '../../services/api'
import type { ResearchStage } from '../../types'

function BottomHUD() {
  const [input, setInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stage = useResearchStore((state) => state.stage)
  const setStage = useResearchStore((state) => state.setStage)
  const topic = useResearchStore((state) => state.topic)
  const setTopic = useResearchStore((state) => state.setTopic)
  const setPapers = useResearchStore((state) => state.setPapers)
  const setGraphData = useResearchStore((state) => state.setGraphData)
  const setStoryOfField = useResearchStore((state) => state.setStoryOfField)
  const setInsights = useResearchStore((state) => state.setInsights)
  const papers = useResearchStore((state) => state.papers)
  const insights = useResearchStore((state) => state.insights)
  const setIdea = useResearchStore((state) => state.setIdea)
  const setNoveltyResult = useResearchStore((state) => state.setNoveltyResult)
  const setDraft = useResearchStore((state) => state.setDraft)
  const setLoading = useResearchStore((state) => state.setLoading)
  const isLoading = useResearchStore((state) => state.isLoading)

  const handleSearch = async () => {
    if (!input.trim() || isLoading) return
    setLoading(true)

    try {
      setTopic(input)
      const result = await searchPapers(input)

      if (result.papers && result.papers.length > 0) {
        setPapers(result.papers)
        setGraphData({ nodes: result.graph_nodes, edges: result.graph_edges })
        setStoryOfField(result.storyOfField)
        setStage('explore')
      } else {
        alert('No papers found for this topic. Please try a different search term.')
      }
    } catch (err: any) {
      console.error('Search failed:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Search failed'
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || isLoading) return
    setLoading(true)

    try {
      const result = await parsePDF(file)
      setTopic(result.title)
      setInput(result.title)

      const uploadYear = new Date().getFullYear()
      const uploadedPaper = {
        id: 'uploaded-paper',
        paperId: 'uploaded-paper',
        title: result.title,
        authors: result.metadata?.author ? [result.metadata.author] : ['Unknown'],
        year: uploadYear,
        abstract: result.abstract || '',
        citations: [],
        references: [],
        keyConcepts: [],
        url: '',
        x: 400,
        y: 300,
        isCentral: true,
        summary: (result.abstract || '').substring(0, 200),
      }

      // Build nodes from extracted citations - show ALL citations
      const allCitations = result.citations || []
      const radius = Math.max(300, allCitations.length * 15)  // Dynamic radius based on number of citations
      const citationNodes = allCitations.map((cit: any, i: number) => {
        // Use extracted title, or fallback to text
        const displayTitle = cit.title || cit.text || `Citation ${i + 1}`
        const authors = cit.authors && cit.authors.length > 0 ? cit.authors : ['Unknown']
        
        return {
          id: `cit-${i}`,
          paperId: `cit-${i}`,
          title: displayTitle,
          authors: authors,
          year: parseInt(cit.year) || 0,
          abstract: '',
          citations: [],
          references: [],
          keyConcepts: [],
          url: cit.url || '',
          x: 400 + radius * Math.cos((2 * Math.PI * i) / Math.max(allCitations.length, 1)),
          y: 300 + radius * Math.sin((2 * Math.PI * i) / Math.max(allCitations.length, 1)),
          isCentral: false,
          summary: cit.text || displayTitle,  // Full citation text
          label: displayTitle.length > 60 ? displayTitle.substring(0, 57) + '...' : displayTitle,
        }
      })

      // Build edges from uploaded paper to citations
      const citationEdges = citationNodes.map((node: any) => ({
        id: `uploaded-paper-${node.id}`,
        source: 'uploaded-paper',
        target: node.id,
        label: 'cites',
      }))

      const allNodes = [uploadedPaper, ...citationNodes]
      setPapers(allNodes)
      setGraphData({
        nodes: allNodes,
        edges: citationEdges,
      })
      setStage('explore')
    } catch (err: any) {
      console.error('PDF parse failed:', err)
      alert(`PDF parsing failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeepenUnderstanding = async () => {
    if (isLoading) return
    setLoading(true)

    try {
      const result = await analyzeGraph(
        useResearchStore.getState().graphData.nodes,
        useResearchStore.getState().graphData.edges,
      )

      const allInsights = [
        ...result.patterns.map((i: { title: string; description: string }) => ({ ...i, type: 'pattern' as const })),
        ...result.contradictions.map((i: { title: string; description: string }) => ({ ...i, type: 'contradiction' as const })),
        ...result.limitations.map((i: { title: string; description: string }) => ({ ...i, type: 'limitation' as const })),
        ...result.gaps.map((i: { title: string; description: string }) => ({ ...i, type: 'gap' as const })),
      ]

      setInsights(allInsights)
      setStage('understand')
    } catch (err: any) {
      console.error('Analysis failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateIdea = async () => {
    if (isLoading) return
    setLoading(true)

    try {
      const result = await generateIdea(papers.slice(0, 8), insights, topic)

      setIdea(result)
      setStage('create')
    } catch (err: any) {
      console.error('Idea generation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefineIdea = async () => {
    const idea = useResearchStore.getState().idea
    if (!idea || isLoading) return
    setLoading(true)

    try {
      const result = await validateNovelty(idea.title, idea.abstract, idea.contributions)

      setNoveltyResult(result)
      setStage('refine')
    } catch (err: any) {
      console.error('Validation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDraft = async () => {
    const idea = useResearchStore.getState().idea
    if (!idea || isLoading) return
    setLoading(true)

    try {
      const result = await generateDraft(idea, papers.slice(0, 8), insights)

      setDraft(result)
      setStage('express')
    } catch (err: any) {
      console.error('Draft generation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const showAction = (requiredStage: ResearchStage): boolean => {
    if (stage === 'idle') return true
    const stageMap: Record<ResearchStage, ResearchStage[]> = {
      idle: ['explore'],
      explore: ['understand', 'create'],
      understand: ['create'],
      create: ['refine'],
      refine: ['express'],
      express: [],
    }
    return (stageMap[stage] || []).includes(requiredStage)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-6 px-4"
    >
      <div className="glass rounded-2xl px-4 py-3 w-full max-w-2xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={stage === 'idle' ? "Enter a research topic..." : "Ask about your research..."}
            className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none"
            disabled={isLoading}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 border border-dark-600/50 rounded-lg transition-colors"
            disabled={isLoading}
          >
            PDF
          </button>

          <button
            onClick={handleSearch}
            disabled={isLoading || !input.trim()}
            className="px-4 py-1.5 text-xs font-medium bg-brain-600 text-white rounded-lg hover:bg-brain-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span className="animate-pulse">Thinking...</span>
            ) : stage === 'idle' ? 'Explore' : 'Send'}
          </button>
        </div>

        <AnimatePresence>
          {stage !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-700/30"
            >
              {showAction('understand') && (
                <button
                  onClick={handleDeepenUnderstanding}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-[11px] font-medium text-brain-300 bg-brain-900/30 border border-brain-700/30 rounded-lg hover:bg-brain-900/50 disabled:opacity-40 transition-all"
                >
                  Deepen Understanding
                </button>
              )}

              {showAction('create') && (
                <button
                  onClick={handleGenerateIdea}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-[11px] font-medium text-purple-300 bg-purple-900/30 border border-purple-700/30 rounded-lg hover:bg-purple-900/50 disabled:opacity-40 transition-all"
                >
                  Generate Idea
                </button>
              )}

              {showAction('refine') && (
                <button
                  onClick={handleRefineIdea}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-[11px] font-medium text-amber-300 bg-amber-900/30 border border-amber-700/30 rounded-lg hover:bg-amber-900/50 disabled:opacity-40 transition-all"
                >
                  Refine Idea
                </button>
              )}

              {showAction('express') && (
                <button
                  onClick={handleGenerateDraft}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-900/30 border border-emerald-700/30 rounded-lg hover:bg-emerald-900/50 disabled:opacity-40 transition-all"
                >
                  Generate Draft
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default BottomHUD
