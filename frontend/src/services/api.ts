import axios from 'axios'
import type { Paper, GraphData, Insight, GeneratedIdea, NoveltyResult, Draft, ChatMessage, User, AuthResponse, ProjectSummary, ResearchProject } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('papertrail_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const register = async (email: string, password: string, name: string, role?: string): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/register', { email, password, name, role })
  return data
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

// Project APIs
export const saveProject = async (project: ResearchProject) => {
  const { data } = await api.post('/projects', project)
  return data
}

export const listProjects = async (): Promise<ProjectSummary[]> => {
  const { data } = await api.get('/projects')
  return data
}

export const loadProject = async (id: string) => {
  const { data } = await api.get(`/projects/${id}`)
  return data
}

export const updateProject = async (id: string, project: ResearchProject) => {
  const { data } = await api.put(`/projects/${id}`, project)
  return data
}

export const deleteProject = async (id: string) => {
  const { data } = await api.delete(`/projects/${id}`)
  return data
}

// Research APIs
export const searchPapers = async (topic: string) => {
  const { data } = await api.post('/search_papers', { topic })
  return data
}

export const parsePDF = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/parse_pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const generateSummary = async (paperIds: string[], topic: string) => {
  const { data } = await api.post('/generate_summary', { paperIds, topic })
  return data
}

export const analyzeGraph = async (nodes: any[], edges: any[]) => {
  const { data } = await api.post('/analyze_graph', { nodes, edges })
  return data
}

export const generateIdea = async (papers: any[], insights: any[], topic: string) => {
  const { data } = await api.post('/generate_idea', { papers, insights, topic })
  return data
}

export const validateNovelty = async (title: string, abstract: string, contributions: string[]) => {
  const { data } = await api.post('/validate_novelty', { title, abstract, contributions })
  return data
}

export const generateDraft = async (idea: any, papers: any[], insights: any[]) => {
  const { data } = await api.post('/generate_draft', { idea, papers, insights })
  return data
}

export const sendChatMessage = async (message: string, context: any) => {
  const { data } = await api.post('/chat', { message, context })
  return data
}

export default api
