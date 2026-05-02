import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useResearchStore } from '../../store/researchStore'
import { sendChatMessage } from '../../services/api'

function UnderstandingMode() {
  const insights = useResearchStore((state) => state.insights)
  const papers = useResearchStore((state) => state.papers)
  const chatMessages = useResearchStore((state) => state.chatMessages)
  const addChatMessage = useResearchStore((state) => state.addChatMessage)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: Date.now(),
    }
    addChatMessage(userMsg)
    setInput('')
    setIsTyping(true)

    try {
      const context = {
        papers: papers.slice(0, 8),
        insights,
      }
      const response = await sendChatMessage(input, context)

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.response,
        timestamp: Date.now(),
      }
      addChatMessage(assistantMsg)
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }
      addChatMessage(errMsg)
    } finally {
      setIsTyping(false)
    }
  }

  const insightIcons: Record<string, string> = {
    pattern: '🔗',
    contradiction: '⚡',
    limitation: '⚠️',
    gap: '🔍',
  }

  const insightColors: Record<string, string> = {
    pattern: 'text-brain-300 bg-brain-900/30 border-brain-700/30',
    contradiction: 'text-red-300 bg-red-900/30 border-red-700/30',
    limitation: 'text-amber-300 bg-amber-900/30 border-amber-700/30',
    gap: 'text-purple-300 bg-purple-900/30 border-purple-700/30',
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Insights ({insights.length})
        </h3>

        {insights.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Click "Deepen Understanding" to generate insights from the research graph.
          </p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-lg border ${insightColors[insight.type] || insightColors.pattern}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{insightIcons[insight.type]}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider">{insight.type}</span>
                </div>
                <h4 className="text-xs font-medium text-gray-200">{insight.title}</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{insight.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Ask About Your Research
        </h3>

        <div className="space-y-3 max-h-[250px] overflow-y-auto scrollbar-thin mb-3">
          <AnimatePresence>
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-brain-600 text-white'
                      : 'bg-dark-800/50 text-gray-300 border border-dark-700/30'
                    }
                  `}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-lg bg-dark-800/50 border border-dark-700/30">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="What patterns do you see?"
            className="flex-1 bg-dark-800/50 border border-dark-700/30 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-brain-600/50 transition-colors"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="px-3 py-2 bg-brain-600 text-white rounded-lg text-xs font-medium hover:bg-brain-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnderstandingMode
