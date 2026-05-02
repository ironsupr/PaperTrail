import { useEffect, useState } from 'react'
import { useResearchStore } from '../../store/researchStore'
import type { ResearchStage, ProjectSummary } from '../../types'
import { listProjects, saveProject, loadProject, deleteProject } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiFolderAdd, HiOutlineFolderOpen, HiTrash, HiPlus } from 'react-icons/hi'
import PaperSidebar from './PaperSidebar'
import GraphBackground from './GraphBackground'
import IntelligencePanel from './IntelligencePanel'
import BottomHUD from './BottomHUD'
import TopStepper from './TopStepper'

const ResearcherWorkspace: React.FC = () => {
  const user = useResearchStore((state) => state.user)
  const token = useResearchStore((state) => state.token)
  const projects = useResearchStore((state) => state.projects)
  const setProjects = useResearchStore((state) => state.setProjects)
  const setCurrentProjectId = useResearchStore((state) => state.setCurrentProjectId)
  const currentProjectId = useResearchStore((state) => state.currentProjectId)
  const stage = useResearchStore((state) => state.stage)
  const isLoadingProject = useResearchStore((state) => state.isLoadingProject)
  const setLoadingProject = useResearchStore((state) => state.setLoadingProject)
  const setSaving = useResearchStore((state) => state.setSaving)
  const isSaving = useResearchStore((state) => state.isSaving)

  const [showProjectPanel, setShowProjectPanel] = useState(true)
  const navigate = useNavigate()

  // Load projects on mount
  useEffect(() => {
    if (token) {
      loadProjectsList()
    }
  }, [token])

  const loadProjectsList = async () => {
    try {
      setLoadingProject(true)
      const data = await listProjects()
      setProjects(data)
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoadingProject(false)
    }
  }

  const handleSaveProject = async () => {
    const state = useResearchStore.getState()
    try {
      setSaving(true)
      const projectData = {
        name: state.topic || 'Untitled Project',
        topic: state.topic,
        stage: state.stage,
        papers: state.papers,
        graphData: state.graphData,
        insights: state.insights,
        idea: state.idea,
        noveltyResult: state.noveltyResult,
        draft: state.draft,
        chatMessages: state.chatMessages,
      }

      if (currentProjectId) {
        await saveProject({ ...projectData, id: currentProjectId })
      } else {
        const result = await saveProject(projectData)
        setCurrentProjectId(result.id)
      }

      await loadProjectsList()
      alert('Project saved successfully!')
    } catch (err: any) {
      console.error('Failed to save project:', err)
      alert('Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const handleLoadProject = async (projectId: string) => {
    try {
      setLoadingProject(true)
      const data = await loadProject(projectId)
      const state = useResearchStore.getState()

      // Parse and restore state
      const projectData = JSON.parse(data.data)
      const setTopic = useResearchStore.getState().setTopic
      const setPapers = useResearchStore.getState().setPapers
      const setGraphData = useResearchStore.getState().setGraphData
      const setInsights = useResearchStore.getState().setInsights
      const setIdea = useResearchStore.getState().setIdea
      const setNoveltyResult = useResearchStore.getState().setNoveltyResult
      const setDraft = useResearchStore.getState().setDraft
      const setStage = useResearchStore.getState().setStage

      setStage(projectData.stage || 'idle')
      setTopic(projectData.topic || '')
      setPapers(projectData.papers || [])
      setGraphData(projectData.graphData || { nodes: [], edges: [] })
      setInsights(projectData.insights || [])
      setIdea(projectData.idea || null)
      setNoveltyResult(projectData.noveltyResult || null)
      setDraft(projectData.draft || null)

      setCurrentProjectId(projectId)
      setShowProjectPanel(false)
    } catch (err: any) {
      console.error('Failed to load project:', err)
      alert('Failed to load project')
    } finally {
      setLoadingProject(false)
    }
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await deleteProject(projectId)
      await loadProjectsList()
      if (currentProjectId === projectId) {
        setCurrentProjectId(null)
      }
    } catch (err) {
      console.error('Failed to delete project:', err)
    }
  }

  const handleNewProject = () => {
    setCurrentProjectId(null)
    const state = useResearchStore.getState()
    state.setStage('idle')
    state.setTopic('')
    state.setPapers([])
    state.setGraphData({ nodes: [], edges: [] })
    state.setInsights([])
    state.setIdea(null)
    state.setNoveltyResult(null)
    state.setDraft(null)
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-900 text-white flex">
      {/* Project Panel (Left Sidebar) */}
      {showProjectPanel && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="w-80 bg-dark-800/90 backdrop-blur-sm border-r border-dark-700/50 p-4 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Projects</h2>
            <button
              onClick={() => setShowProjectPanel(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <button
            onClick={handleNewProject}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold mb-4 flex items-center justify-center gap-2"
          >
            <HiPlus /> New Project
          </button>

          <button
            onClick={handleSaveProject}
            disabled={isSaving}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold mb-6 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <HiFolderAdd /> {isSaving ? 'Saving...' : 'Save Current Project'}
          </button>

          {isLoadingProject ? (
            <div className="text-gray-400 text-sm">Loading projects...</div>
          ) : (
            <div className="space-y-3">
              {projects.map((project: ProjectSummary) => (
                <div
                  key={project.id}
                  onClick={() => handleLoadProject(project.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    currentProjectId === project.id
                      ? 'bg-indigo-600/20 border-indigo-500'
                      : 'bg-dark-700/50 border-dark-600 hover:bg-dark-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">{project.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{project.topic}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.stage === 'idle' ? 'bg-gray-600' :
                          project.stage === 'explore' ? 'bg-blue-600' :
                          project.stage === 'understand' ? 'bg-yellow-600' :
                          project.stage === 'create' ? 'bg-green-600' :
                          project.stage === 'refine' ? 'bg-purple-600' :
                          'bg-pink-600'
                        } text-white`}>
                          {project.stage}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-dark-800/50 backdrop-blur-sm border-b border-dark-700/50">
          <div className="flex items-center gap-4">
            {!showProjectPanel && (
              <button
                onClick={() => setShowProjectPanel(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiOutlineFolderOpen className="text-xl" />
              </button>
            )}
            <span className="text-sm text-gray-400">
              {user?.name} | <span className="text-indigo-400">Researcher Workspace</span>
            </span>
          </div>
          {currentProjectId && (
            <span className="text-xs text-gray-500">
              Project ID: {currentProjectId}
            </span>
          )}
        </div>

        {/* Top Stepper */}
        <TopStepper />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <PaperSidebar />
          <div className="flex-1 relative">
            <GraphBackground />
          </div>
          <IntelligencePanel />
        </div>

        {/* Bottom HUD */}
        <BottomHUD />
      </div>
    </div>
  )
}

export default ResearcherWorkspace
