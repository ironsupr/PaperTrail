import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ResearchStage,
  Paper,
  GraphData,
  GraphNode,
  GraphEdge,
  Insight,
  GeneratedIdea,
  NoveltyResult,
  ChatMessage,
  Draft,
  User,
  UserRole,
  ProjectSummary,
} from '../types'

interface ResearchState {
  // Auth state
  user: User | null
  token: string | null
  isAuthenticated: boolean
  userRole: UserRole | null

  // Project state
  currentProjectId: string | null
  projects: ProjectSummary[]
  isSaving: boolean
  isLoadingProject: boolean

  // Research state
  stage: ResearchStage
  topic: string
  papers: Paper[]
  graphData: GraphData
  selectedNodeId: string | null
  insights: Insight[]
  storyOfField: string
  idea: GeneratedIdea | null
  noveltyResult: NoveltyResult | null
  chatMessages: ChatMessage[]
  draft: Draft | null
  isLoading: boolean
  isStreaming: boolean
  theme: 'dark' | 'light'

  // Auth actions
  login: (token: string, user: User) => void
  logout: () => void
  setUserRole: (role: UserRole) => void

  // Project actions
  setCurrentProjectId: (id: string | null) => void
  setProjects: (projects: ProjectSummary[]) => void
  setSaving: (saving: boolean) => void
  setLoadingProject: (loading: boolean) => void

  // Research actions
  setStage: (stage: ResearchStage) => void
  setTopic: (topic: string) => void
  setPapers: (papers: Paper[]) => void
  setGraphData: (data: GraphData) => void
  selectNode: (nodeId: string | null) => void
  setInsights: (insights: Insight[]) => void
  setStoryOfField: (story: string) => void
  setIdea: (idea: GeneratedIdea | null) => void
  setNoveltyResult: (result: NoveltyResult | null) => void
  addChatMessage: (message: ChatMessage) => void
  setDraft: (draft: Draft | null) => void
  setLoading: (loading: boolean) => void
  setStreaming: (streaming: boolean) => void
  toggleTheme: () => void

  // Getters
  getSelectedPaper: () => Paper | null
  getSelectedNode: () => GraphNode | null
  getContextSummary: () => string
}

export const useResearchStore = create<ResearchState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      userRole: null,

      // Project state
      currentProjectId: null,
      projects: [],
      isSaving: false,
      isLoadingProject: false,

      // Research state
      stage: 'idle',
      topic: '',
      papers: [],
      graphData: { nodes: [], edges: [] },
      selectedNodeId: null,
      insights: [],
      storyOfField: '',
      idea: null,
      noveltyResult: null,
      chatMessages: [],
      draft: null,
      isLoading: false,
      isStreaming: false,
      theme: 'dark',

      // Auth actions
      login: (token, user) => {
        localStorage.setItem('papertrail_token', token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('papertrail_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          userRole: null,
          currentProjectId: null,
          projects: [],
          stage: 'idle',
          topic: '',
          papers: [],
          graphData: { nodes: [], edges: [] },
          selectedNodeId: null,
          insights: [],
          storyOfField: '',
          idea: null,
          noveltyResult: null,
          chatMessages: [],
          draft: null,
        })
      },
      setUserRole: (role) => {
        localStorage.setItem('papertrail_role', role)
        set({ userRole: role })
      },

      // Project actions
      setCurrentProjectId: (id) => set({ currentProjectId: id }),
      setProjects: (projects) => set({ projects }),
      setSaving: (saving) => set({ isSaving: saving }),
      setLoadingProject: (loading) => set({ isLoadingProject: loading }),

      // Research actions
      setStage: (stage) => set({ stage }),
      setTopic: (topic) => set({ topic }),
      setPapers: (papers) => set({ papers }),
      setGraphData: (graphData) => set({ graphData }),
      selectNode: (selectedNodeId) => set({ selectedNodeId }),
      setInsights: (insights) => set({ insights }),
      setStoryOfField: (storyOfField) => set({ storyOfField }),
      setIdea: (idea) => set({ idea }),
      setNoveltyResult: (noveltyResult) => set({ noveltyResult }),
      addChatMessage: (message) =>
        set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      setDraft: (draft) => set({ draft }),
      setLoading: (isLoading) => set({ isLoading }),
      setStreaming: (isStreaming) => set({ isStreaming }),
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.classList.toggle('dark', newTheme === 'dark')
          return { theme: newTheme }
        }),

      // Getters
      getSelectedPaper: () => {
        const { selectedNodeId, papers } = get()
        const node = get().graphData.nodes.find((n) => n.id === selectedNodeId)
        if (!node) return null
        return papers.find((p) => p.id === node.paperId) || null
      },

      getSelectedNode: () => {
        const { selectedNodeId, graphData } = get()
        return graphData.nodes.find((n) => n.id === selectedNodeId) || null
      },

      getContextSummary: () => {
        const { papers, insights, topic, idea } = get()
        let summary = `Research topic: ${topic}. `
        summary += `Exploring ${papers.length} papers. `
        if (insights.length > 0) {
          summary += `Found ${insights.length} insights. `
        }
        if (idea) {
          summary += `Generated idea: ${idea.title}. `
        }
        return summary
      },
    }),
    {
      name: 'papertrail-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        theme: state.theme,
      }),
    }
  )
)
