from pydantic import BaseModel
from typing import List, Optional


class SearchRequest(BaseModel):
    topic: str


class PaperResponse(BaseModel):
    id: str
    title: str
    authors: List[str]
    year: int
    abstract: str
    citations: List[str] = []
    references: List[str] = []
    keyConcepts: Optional[List[str]] = []


class SearchResponse(BaseModel):
    papers: List[PaperResponse]
    graph_nodes: List[dict]
    graph_edges: List[dict]


class SummaryRequest(BaseModel):
    paperIds: List[str]
    topic: str


class SummaryResponse(BaseModel):
    storyOfField: str
    insights: List[dict]


class GraphAnalysisRequest(BaseModel):
    nodes: List[dict]
    edges: List[dict]


class GraphAnalysisResponse(BaseModel):
    patterns: List[dict]
    contradictions: List[dict]
    limitations: List[dict]
    gaps: List[dict]
    summary: str


class IdeaRequest(BaseModel):
    papers: List[dict]
    insights: List[dict]
    topic: str


class IdeaResponse(BaseModel):
    title: str
    abstract: str
    contributions: List[str]
    methodDirection: str
    researchGap: str


class NoveltyRequest(BaseModel):
    title: str
    abstract: str
    contributions: List[str]


class NoveltyResponse(BaseModel):
    noveltyScore: int
    rejectionProbability: int
    riskLevel: str
    similarPapers: List[dict]
    reviewerFeedback: dict


class DraftRequest(BaseModel):
    idea: dict
    papers: List[dict]
    insights: List[dict]


class DraftResponse(BaseModel):
    title: str
    sections: List[dict]
    citations: List[dict]


class ChatRequest(BaseModel):
    message: str
    context: dict


class ChatResponse(BaseModel):
    response: str


# Auth schemas
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "researcher"


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user: dict


# Project schemas
class ProjectSaveRequest(BaseModel):
    name: str
    topic: str
    stage: str
    data: dict  # JSON string of research state


class ProjectResponse(BaseModel):
    id: int
    name: str
    topic: str
    stage: str
    created_at: str
    updated_at: str


class ProjectDetailResponse(ProjectResponse):
    data: str  # Full project data as JSON string
