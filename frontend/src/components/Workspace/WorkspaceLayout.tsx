import GraphBackground from './GraphBackground'
import IntelligencePanel from './IntelligencePanel'
import TopStepper from './TopStepper'
import BottomHUD from './BottomHUD'
import PaperSidebar from './PaperSidebar'
import { useResearchStore } from '../../store/researchStore'

function WorkspaceLayout() {
  const theme = useResearchStore((state) => state.theme)
  const toggleTheme = useResearchStore((state) => state.toggleTheme)

  return (
    <div className={`relative h-full w-full overflow-hidden ${theme === 'dark' ? 'bg-dark-900' : 'bg-gray-50'}`}>
      <GraphBackground />
      <PaperSidebar />
      <TopStepper />
      <IntelligencePanel />
      <BottomHUD />

      <div className="absolute top-4 right-[440px] z-30 flex gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg glass text-gray-400 hover:text-gray-200 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 118-8 4 4 0 010 8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default WorkspaceLayout
