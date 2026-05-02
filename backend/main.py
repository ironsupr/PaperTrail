from dotenv import load_dotenv
load_dotenv()

import os
import json
import tempfile
from typing import List, Dict, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from models.schemas import (
    SearchRequest, SearchResponse, SummaryRequest, SummaryResponse,
    GraphAnalysisRequest, GraphAnalysisResponse, IdeaRequest, IdeaResponse,
    NoveltyRequest, NoveltyResponse, DraftRequest, DraftResponse,
    ChatRequest, ChatResponse, PaperResponse,
    RegisterRequest, LoginRequest, AuthResponse,
    ProjectSaveRequest, ProjectResponse, ProjectDetailResponse,
)
from services.paper_search import (
    search_semantic_scholar, build_graph_nodes, build_graph_edges,
)
from services.pdf_parser import parse_pdf
from services.ai_engine import (
    generate_with_context, generate_story_of_field,
    generate_insights, generate_idea_from_context,
    generate_reviewer_feedback, generate_draft,
)
from services.graph_analyzer import analyze_graph_structure
from services.novelty_guard import novelty_guard
from services.auth_service import (
    authenticate_user, create_access_token, decode_token,
    get_password_hash,
)
from database import get_db, create_tables
from models.user import User
from models.project import Project

app = FastAPI(title="PaperTrail OS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


# Startup event to create tables
@app.on_event("startup")
async def startup():
    create_tables()
    print("Database tables created successfully")


# Auth dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@app.post("/api/search_papers")
async def search_papers(request: SearchRequest):
    """Search papers and build initial graph."""
    try:
        papers = await search_semantic_scholar(request.topic)
        nodes = build_graph_nodes(papers)
        edges = build_graph_edges(papers)

        story = await generate_story_of_field(papers, request.topic)

        return {
            "papers": papers,
            "graph_nodes": nodes,
            "graph_edges": edges,
            "storyOfField": story,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/parse_pdf")
async def parse_pdf_endpoint(file: UploadFile = File(...)):
    """Parse uploaded PDF file and extract citations."""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        result = await parse_pdf(tmp_path)

        os.unlink(tmp_path)

        return {
            "title": result["title"],
            "abstract": result["abstract"],
            "full_text": result["full_text"][:5000],
            "pages": result["pages"],
            "citations": result.get("citations", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate_summary")
async def generate_summary(request: SummaryRequest):
    """Generate field summary and insights."""
    try:
        insights_raw = await generate_insights([], request.topic)

        try:
            insights = json.loads(insights_raw) if isinstance(insights_raw, str) else insights_raw
        except json.JSONDecodeError:
            insights = [
                {"type": "pattern", "title": "Analysis available", "description": insights_raw[:500]}
            ]

        return {
            "storyOfField": "",
            "insights": insights,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze_graph")
async def analyze_graph(request: GraphAnalysisRequest):
    """Analyze graph structure and generate insights."""
    try:
        analysis = analyze_graph_structure(request.nodes, request.edges)

        nodes_with_abstracts = [n for n in request.nodes]
        insights_raw = await generate_insights(
            [{"title": n.get("label", ""), "abstract": n.get("summary", ""), "keyConcepts": []} for n in request.nodes[:8]],
            "research field",
        )

        try:
            insights = json.loads(insights_raw) if isinstance(insights_raw, str) else insights_raw
        except json.JSONDecodeError:
            insights = [
                {"type": "pattern", "title": "Pattern found", "description": insights_raw[:300]}
            ]

        categorized = {"patterns": [], "contradictions": [], "limitations": [], "gaps": []}
        for insight in insights:
            t = insight.get("type", "pattern")
            if t in categorized:
                categorized[t].append(insight)
            else:
                categorized["patterns"].append(insight)

        return {
            "patterns": categorized["patterns"],
            "contradictions": categorized["contradictions"],
            "limitations": categorized["limitations"],
            "gaps": categorized["gaps"],
            "summary": f"Analyzed {analysis['total_papers']} papers with {analysis['total_connections']} citation connections.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate_idea")
async def generate_idea(request: IdeaRequest):
    """Generate a novel research idea from context."""
    try:
        result = await generate_idea_from_context(request.papers, request.insights, request.topic)

        try:
            if isinstance(result, str):
                result = json.loads(result)
        except json.JSONDecodeError:
            result = {
                "title": "Research Idea",
                "abstract": result[:500] if isinstance(result, str) else "",
                "contributions": [],
                "methodDirection": "",
                "researchGap": "",
            }

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/validate_novelty")
async def validate_novelty(request: NoveltyRequest):
    """Validate novelty of a research idea."""
    try:
        novelty_result = await novelty_guard.check_novelty(
            request.title, request.abstract, request.contributions, []
        )

        reviewer_feedback = await generate_reviewer_feedback(
            {"title": request.title, "abstract": request.abstract, "contributions": request.contributions},
            novelty_result.get("similarPapers", []),
        )

        try:
            if isinstance(reviewer_feedback, str):
                reviewer_feedback = json.loads(reviewer_feedback)
        except json.JSONDecodeError:
            reviewer_feedback = {
                "strengths": ["Novel approach"],
                "weaknesses": ["Needs more validation"],
                "suggestions": ["Consider additional experiments"],
            }

        return {
            **novelty_result,
            "reviewerFeedback": reviewer_feedback,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate_draft")
async def generate_draft_endpoint(request: DraftRequest):
    """Generate structured draft from idea and context."""
    try:
        result = await generate_draft(request.idea, request.papers, request.insights)

        try:
            if isinstance(result, str):
                result = json.loads(result)
        except json.JSONDecodeError:
            result = {
                "title": request.idea.get("title", "Research Draft"),
                "sections": [{"heading": "Draft", "content": result[:2000] if isinstance(result, str) else ""}],
                "citations": [],
            }

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat with context-aware AI."""
    try:
        context_text = json.dumps(request.context, indent=2)[:3000]
        prompt = f"""Context from the research workspace:
{context_text}

User question: {request.message}

Answer based on the research context provided. Be specific and reference relevant papers or insights when applicable."""

        response = await generate_with_context(prompt)

        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "PaperTrail OS"}


# Auth endpoints
@app.post("/api/auth/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user exists
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    from services.auth_service import get_password_hash
    hashed_password = get_password_hash(request.password)
    user = User(
        email=request.email,
        name=request.name,
        hashed_password=hashed_password,
        role=request.role or "researcher",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create token
    from services.auth_service import create_access_token
    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
    }


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user."""
    from services.auth_service import authenticate_user, create_access_token
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
    }


@app.get("/api/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user info."""
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


# Project endpoints
@app.post("/api/projects")
async def save_project(
    request: ProjectSaveRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or update a project."""
    import json
    project = Project(
        user_id=user.id,
        name=request.name,
        topic=request.topic,
        stage=request.stage,
        data=json.dumps(request.data),
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "id": project.id,
        "name": project.name,
        "topic": project.topic,
        "stage": project.stage,
        "created_at": project.created_at.isoformat() if project.created_at else "",
        "updated_at": project.updated_at.isoformat() if project.updated_at else "",
    }


@app.get("/api/projects", response_model=List[ProjectResponse])
async def list_projects(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's projects."""
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "topic": p.topic,
            "stage": p.stage,
            "created_at": p.created_at.isoformat() if p.created_at else "",
            "updated_at": p.updated_at.isoformat() if p.updated_at else "",
        }
        for p in projects
    ]


@app.get("/api/projects/{project_id}", response_model=ProjectDetailResponse)
async def load_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Load a specific project."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": project.id,
        "name": project.name,
        "topic": project.topic,
        "stage": project.stage,
        "created_at": project.created_at.isoformat() if project.created_at else "",
        "updated_at": project.updated_at.isoformat() if project.updated_at else "",
        "data": project.data,
    }


@app.put("/api/projects/{project_id}")
async def update_project(
    project_id: int,
    request: ProjectSaveRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing project."""
    import json
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.name = request.name
    project.topic = request.topic
    project.stage = request.stage
    project.data = json.dumps(request.data)

    db.commit()
    db.refresh(project)

    return {
        "id": project.id,
        "name": project.name,
        "topic": project.topic,
        "stage": project.stage,
        "created_at": project.created_at.isoformat() if project.created_at else "",
        "updated_at": project.updated_at.isoformat() if project.updated_at else "",
    }


@app.delete("/api/projects/{project_id}")
async def delete_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()

    return {"message": "Project deleted"}
