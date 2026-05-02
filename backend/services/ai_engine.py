import os
from dotenv import load_dotenv
import google.generativeai as genai
import asyncio
from typing import List, Dict, Optional
import re
import uuid
from datetime import datetime

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "")


def get_model(model_name: str = "gemini-3-flash-preview"):
    """Get Gemini model instance."""
    return genai.GenerativeModel(model_name)


async def generate_with_context(
    prompt: str,
    context: str = "",
    system_instruction: str = "",
) -> str:
    """Generate text using Gemini with full context."""
    model = genai.GenerativeModel(
        model_name="gemini-3-flash-preview",
        system_instruction=system_instruction or """You are PaperTrail OS, a continuous research intelligence assistant.
You help researchers explore, understand, create, and refine research ideas.
You maintain context across interactions and build on previous insights.
Never repeat information already provided. Always be progressive in your analysis.
Provide structured, actionable output.""",
    )

    full_prompt = f"{context}\n\n{prompt}" if context else prompt
    response = await model.generate_content_async(full_prompt)
    return response.text


async def generate_story_of_field(papers: List[Dict], topic: str) -> str:
    """Generate a narrative summary of the research field evolution."""
    paper_context = "\n".join([
        f"- {p['title']} ({p['year']}): {p.get('abstract', '')[:150]}"
        for p in papers[:10]
    ])

    prompt = f"""Given the following papers on the topic of "{topic}", write a compelling narrative about how this research field has evolved.
Focus on:
1. How the field started and key breakthroughs
2. Major shifts in thinking or approach
3. Current state and open questions
4. Where the field seems to be heading

Papers:
{paper_context}

Write as a cohesive story, not a list. Max 300 words."""

    return await generate_with_context(prompt)


async def generate_insights(papers: List[Dict], topic: str) -> List[Dict]:
    """Generate analytical insights about the research landscape."""
    paper_context = "\n".join([
        f"Paper: {p['title']}\nAbstract: {p.get('abstract', '')[:200]}\nKey concepts: {', '.join(p.get('keyConcepts', [])[:5])}"
        for p in papers[:10]
    ])

    prompt = f"""Analyze the following research papers on "{topic}" and identify:

1. PATTERNS: Common approaches, methods, or findings across multiple papers
2. CONTRADICTIONS: Conflicting results, methods, or conclusions between papers
3. LIMITATIONS: What current approaches are missing or doing poorly
4. RESEARCH GAPS: Areas that haven't been explored yet

For each insight, provide a title and detailed description.

Papers:
{paper_context}

Return as a JSON array with objects having: type (pattern|contradiction|limitation|gap), title, description."""

    result = await generate_with_context(prompt)
    return result


async def generate_idea_from_context(
    papers: List[Dict],
    insights: List[Dict],
    topic: str,
) -> Dict:
    """Generate a novel research idea based on context."""
    paper_context = "\n".join([
        f"- {p['title']}: {p.get('abstract', '')[:150]}"
        for p in papers[:8]
    ])

    insight_context = "\n".join([
        f"- [{i.get('type', '')}] {i.get('title', '')}: {i.get('description', '')[:100]}"
        for i in insights[:5]
    ])

    prompt = f"""Based on the following research landscape, generate ONE novel and compelling research idea.

TOPIC: {topic}

EXISTING PAPERS:
{paper_context}

KEY INSIGHTS & GAPS:
{insight_context}

Generate a research idea that:
1. Addresses a genuine gap in the field
2. Is novel but grounded in existing work
3. Has clear methodological direction
4. Would make meaningful contributions

Return as a JSON object with:
- title: Short, catchy research idea title
- abstract: 150-200 word abstract
- contributions: Array of 3-4 specific contributions
- methodDirection: High-level methodological approach
- researchGap: What specific gap this addresses"""

    result = await generate_with_context(prompt)
    return result


async def generate_reviewer_feedback(
    idea: Dict,
    similar_papers: List[Dict],
) -> Dict:
    """Simulate reviewer feedback on a research idea."""
    similar_context = "\n".join([
        f"- {sp['title']} (similarity: {sp['similarity']}): {sp.get('abstract', '')[:100]}"
        for sp in similar_papers[:5]
    ])

    prompt = f"""Act as a rigorous peer reviewer evaluating the following research idea.

IDEA:
Title: {idea.get('title', '')}
Abstract: {idea.get('abstract', '')}
Contributions: {', '.join(idea.get('contributions', []))}

SIMILAR EXISTING WORK:
{similar_context}

Provide structured feedback as:
1. STRENGTHS: What makes this idea strong
2. WEAKNESSES: What could be improved or challenged
3. SUGGESTIONS: Specific recommendations to strengthen the idea

Be constructive but rigorous. Return as JSON with strengths, weaknesses, suggestions arrays."""

    result = await generate_with_context(prompt)
    return result


async def generate_draft(
    idea: Dict,
    papers: List[Dict],
    insights: List[Dict],
) -> Dict:
    """Generate a structured draft (literature review + sections)."""
    paper_context = "\n".join([
        f"[{i+1}] {p['title']} ({p['year']}): {p.get('abstract', '')[:100]}"
        for i, p in enumerate(papers[:8])
    ])

    prompt = f"""Generate a structured research draft based on the following idea and context.

IDEA:
Title: {idea.get('title', '')}
Abstract: {idea.get('abstract', '')}
Contributions: {', '.join(idea.get('contributions', []))}

REFERENCE PAPERS:
{paper_context}

Generate a structured draft with these sections:
1. Introduction (motivation, problem statement, contributions)
2. Related Work (synthesizing the reference papers)
3. Proposed Method (based on the method direction)
4. Expected Results and Evaluation
5. Conclusion

For each section, provide substantive content (not just outlines).
Include citation markers [1], [2], etc. referencing the papers above.

Return as JSON with sections array (each having heading and content) and citations array."""

    result = await generate_with_context(prompt)
    return result
