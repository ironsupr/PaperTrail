import { useEffect, useState } from 'react'
import { useResearchStore } from '../../store/researchStore'
import type { NoveltyResult } from '../../types'
import { validateNovelty } from '../../services/api'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiExclamationCircle, HiXCircle } from 'react-icons/hi'

const NoveltyDashboard: React.FC = () => {
  const idea = useResearchStore((state) => state.idea)
  const noveltyResult = useResearchStore((state) => state.noveltyResult)
  const setNoveltyResult = useResearchStore((state) => state.setNoveltyResult)
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckNovelty = async () => {
    if (!idea) return
    setIsChecking(true)
    try {
      const result = await validateNovelty(idea.title, idea.abstract, idea.contributions)
      setNoveltyResult(result)
    } catch (err: any) {
      console.error('Novelty check failed:', err)
    } finally {
      setIsChecking(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getRiskColor = (risk: string) => {
    if (risk === 'Low') return 'bg-green-500/20 text-green-400 border-green-500/50'
    if (risk === 'Medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    return 'bg-red-500/20 text-red-400 border-red-500/50'
  }

  const getRiskIcon = (risk: string) => {
    if (risk === 'Low') return <HiCheckCircle className="text-xl" />
    if (risk === 'Medium') return <HiExclamationCircle className="text-xl" />
    return <HiXCircle className="text-xl" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Novelty Dashboard</h2>
        <button
          onClick={handleCheckNovelty}
          disabled={!idea || isChecking}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all"
        >
          {isChecking ? 'Checking...' : 'Check Novelty'}
        </button>
      </div>

      {!idea && (
        <div className="text-center py-8 text-gray-400">
          Generate a research idea first to check novelty
        </div>
      )}

      {noveltyResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Novelty Score */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Novelty Score</h3>
              <span className={`text-4xl font-bold ${getScoreColor(noveltyResult.noveltyScore)}`}>
                {noveltyResult.noveltyScore}
              </span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  noveltyResult.noveltyScore >= 70 ? 'bg-green-500' :
                  noveltyResult.noveltyScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${noveltyResult.noveltyScore}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* Risk Level */}
          <div className={`glass p-6 rounded-2xl border ${getRiskColor(noveltyResult.riskLevel)}`}>
            <div className="flex items-center gap-3 mb-2">
              {getRiskIcon(noveltyResult.riskLevel)}
              <div>
                <h3 className="font-semibold">Risk Level: {noveltyResult.riskLevel}</h3>
                <p className="text-sm opacity-80">
                  Rejection Probability: {noveltyResult.rejectionProbability}%
                </p>
              </div>
            </div>
          </div>

          {/* Similar Papers */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Similar Papers</h3>
            <div className="space-y-3">
              {noveltyResult.similarPapers.map((paper, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-dark-700/50 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">{paper.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{paper.abstract?.substring(0, 100)}...</p>
                    </div>
                    <span className={`text-sm font-bold ${
                      paper.similarity >= 0.7 ? 'text-red-400' :
                      paper.similarity >= 0.4 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {(paper.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reviewer Feedback */}
          {noveltyResult.reviewerFeedback && (
            <div className="glass p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-semibold text-white">Reviewer Feedback</h3>

              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {noveltyResult.reviewerFeedback.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">Weaknesses</h4>
                <ul className="space-y-1">
                  {noveltyResult.reviewerFeedback.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">✗</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-indigo-400 mb-2">Suggestions</h4>
                <ul className="space-y-1">
                  {noveltyResult.reviewerFeedback.suggestions.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default NoveltyDashboard
