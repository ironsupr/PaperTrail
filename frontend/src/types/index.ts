export type ResearchStage = 'idle' | 'explore' | 'understand' | 'create' | 'refine' | 'express'

export interface Paper {
  id: string
  title: string
  authors: string[]
  year: number
  abstract: string
  citations: string[]
  references: string[]
  embedding?: number[]
  keyConcepts?: string[]
  url?: string
}

export interface GraphNode {
  id: string
  paperId: string
  x: number
  y: number
  label: string
  summary: string
  year: number
  isCentral?: boolean
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface Insight {
  type: 'pattern' | 'contradiction' | 'limitation' | 'gap'
  title: string
  description: string
  relatedPapers?: string[]
}

export interface GeneratedIdea {
  title: string
  abstract: string
  contributions: string[]
  methodDirection: string
  researchGap: string
}

export interface NoveltyResult {
  noveltyScore: number
  rejectionProbability: number
  riskLevel: 'Low' | 'Medium' | 'High'
  similarPapers: {
    title: string
    similarity: number
    abstract: string
  }[]
  reviewerFeedback: {
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Draft {
  title: string
  sections: {
    heading: string
    content: string
  }[]
  citations: { id: string; title: string }[]
}

export type UserRole = 'researcher' | 'student' | 'reviewer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface ProjectSummary {
  id: string
  name: string
  topic: string
  stage: ResearchStage
  created_at: string
  updated_at: string
}

export interface ResearchProject {
  id?: string
  name: string
  topic: string
  stage: ResearchStage
  papers: Paper[]
  graphData: GraphData
  insights: Insight[]
  idea: GeneratedIdea | null
  noveltyResult: NoveltyResult | null
  draft: Draft | null
  chatMessages: ChatMessage[]
}
