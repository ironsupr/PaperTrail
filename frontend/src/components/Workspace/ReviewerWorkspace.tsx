import { useEffect, useState } from 'react'
import { useResearchStore } from '../../store/researchStore'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiEye, HiOutlineClipboardCheck, HiDocumentReport, HiOutlineSwitchHorizontal } from 'react-icons/hi'
import PaperSidebar from './PaperSidebar'
import GraphBackground from './GraphBackground'
import BottomHUD from './BottomHUD'
import TopStepper from './TopStepper'

const ReviewerWorkspace: React.FC = () => {
  const user = useResearchStore((state) => state.user)
  const stage = useResearchStore((state) => state.stage)
  const [activeTool, setActiveTool] = useState<'verify' | 'checklist' | 'report' | 'compare'>('verify')

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-900 text-white flex">
      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-dark-800/50 backdrop-blur-sm border-b border-dark-700/50">
          <div className="flex items-center gap-4">
            <HiEye className="text-2xl text-purple-400" />
            <span className="text-sm text-gray-400">
              {user?.name} | <span className="text-purple-400">Reviewer Workspace</span>
            </span>
          </div>
          <div className="flex gap-2">
            {(['verify', 'checklist', 'report', 'compare'] as const).map((tool) => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === tool
                    ? 'bg-purple-600 text-white'
                    : 'bg-dark-700/50 text-gray-400 hover:bg-dark-700'
                }`}
              >
                {tool === 'verify' && <HiOutlineSwitchHorizontal className="inline mr-1" />}
                {tool === 'checklist' && <HiOutlineClipboardCheck className="inline mr-1" />}
                {tool === 'report' && <HiDocumentReport className="inline mr-1" />}
                {tool === 'compare' && <HiOutlineSwitchHorizontal className="inline mr-1" />}
                {tool.charAt(0).toUpperCase() + tool.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Top Stepper */}
        <TopStepper />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <PaperSidebar />
          <div className="flex-1 relative">
            <GraphBackground />
          </div>

          {/* Tool Panel (Right Side) */}
          <div className="w-[420px] border-l border-dark-700/50 bg-dark-800/90 backdrop-blur-sm overflow-y-auto">
            <div className="p-5">
              <motion.div
                key={activeTool}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTool === 'verify' && <CitationVerificationPanel />}
                {activeTool === 'checklist' && <ReviewChecklist />}
                {activeTool === 'report' && <ReviewReportGenerator />}
                {activeTool === 'compare' && <PaperComparison />}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom HUD */}
        <BottomHUD />
      </div>
    </div>
  )
}

// Import CitationVerificationPanel from existing component
import CitationVerificationPanel from './CitationVerificationPanel'

// Placeholder components - to be implemented
const ReviewChecklist: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">Review Checklist</h2>
    <p className="text-sm text-gray-400">
      Methodological rigor and reproducibility checks
    </p>
    <div className="space-y-3">
      {[
        'Study design validation',
        'Sample size adequacy',
        'Statistical significance',
        'Reproducibility assessment',
        'Ethical considerations',
      ].map((item, i) => (
        <div key={i} className="glass p-3 rounded-xl flex items-center gap-3">
          <input type="checkbox" className="rounded text-purple-600" />
          <span className="text-sm text-gray-300">{item}</span>
        </div>
      ))}
    </div>
  </div>
)

const ReviewReportGenerator: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">Review Report</h2>
    <p className="text-sm text-gray-400">
      Generate structured peer review report
    </p>
    <div className="glass p-4 rounded-xl space-y-3">
      <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold">
        Generate Review Report
      </button>
      <p className="text-sm text-gray-300">
        Report will appear here...
      </p>
    </div>
  </div>
)

const PaperComparison: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">Paper Comparison</h2>
    <p className="text-sm text-gray-400">
      Compare multiple papers side-by-side
    </p>
    <div className="glass p-4 rounded-xl">
      <p className="text-sm text-gray-300">
        Paper comparison will appear here...
      </p>
    </div>
  </div>
)

export default ReviewerWorkspace
