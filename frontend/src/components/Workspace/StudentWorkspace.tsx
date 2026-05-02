import { useEffect, useState } from 'react'
import { useResearchStore } from '../../store/researchStore'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiAcademicCap, HiOutlineLightBulb, HiLink, HiMap, HiOutlineClipboardList } from 'react-icons/hi'
import PaperSidebar from './PaperSidebar'
import GraphBackground from './GraphBackground'
import BottomHUD from './BottomHUD'
import TopStepper from './TopStepper'

const StudentWorkspace: React.FC = () => {
  const user = useResearchStore((state) => state.user)
  const stage = useResearchStore((state) => state.stage)
  const [activeTool, setActiveTool] = useState<'simplify' | 'connections' | 'gaps' | 'learning'>('simplify')

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-900 text-white flex">
      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-dark-800/50 backdrop-blur-sm border-b border-dark-700/50">
          <div className="flex items-center gap-4">
            <HiAcademicCap className="text-2xl text-green-400" />
            <span className="text-sm text-gray-400">
              {user?.name} | <span className="text-green-400">Student Workspace</span>
            </span>
          </div>
          <div className="flex gap-2">
            {(['simplify', 'connections', 'gaps', 'learning'] as const).map((tool) => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === tool
                    ? 'bg-green-600 text-white'
                    : 'bg-dark-700/50 text-gray-400 hover:bg-dark-700'
                }`}
              >
                {tool === 'simplify' && <HiOutlineLightBulb className="inline mr-1" />}
                {tool === 'connections' && <HiLink className="inline mr-1" />}
                {tool === 'gaps' && <HiOutlineClipboardList className="inline mr-1" />}
                {tool === 'learning' && <HiMap className="inline mr-1" />}
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
                {activeTool === 'simplify' && <PaperSimplificationPanel />}
                {activeTool === 'connections' && <ConnectionMapper />}
                {activeTool === 'gaps' && <GapIdentifier />}
                {activeTool === 'learning' && <LearningPath />}
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

// Placeholder components - to be implemented
const PaperSimplificationPanel: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">Paper Simplification</h2>
    <p className="text-sm text-gray-400">
      AI-powered plain English summaries of research papers
    </p>
    <div className="glass p-4 rounded-xl">
      <p className="text-sm text-gray-300">
        Select a paper node to see its simplified explanation...
      </p>
    </div>
  </div>
)

const ConnectionMapper: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">Connection Mapper</h2>
    <p className="text-sm text-gray-400">
      Visualize how papers cite and reference each other
    </p>
    <div className="glass p-4 rounded-xl">
      <p className="text-sm text-gray-300">
        Connection mapping will appear here...
      </p>
    </div>
  </div>
)

const GapIdentifier: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">Gap Identifier</h2>
    <p className="text-sm text-gray-400">
      Find unanswered questions across papers
    </p>
    <div className="glass p-4 rounded-xl">
      <p className="text-sm text-gray-300">
        Research gaps will appear here...
      </p>
    </div>
  </div>
)

const LearningPath: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">Learning Path</h2>
    <p className="text-sm text-gray-400">
      Recommended reading order from beginner to advanced
    </p>
    <div className="glass p-4 rounded-xl">
      <p className="text-sm text-gray-300">
        Learning path will appear here...
      </p>
    </div>
  </div>
)

export default StudentWorkspace
