import httpx
import asyncio
from typing import List, Dict, Any


async def search_semantic_scholar(topic: str, limit: int = 15) -> List[Dict[str, Any]]:
    """Search papers using Semantic Scholar API."""
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": topic,
        "limit": limit,
        "fields": "title,authors,year,abstract,citationCount,references,citations,externalIds,tldr",
    }
    headers = {
        "User-Agent": "PaperTrail-OS/1.0 (research-tool)",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            await asyncio.sleep(2)  # Rate limiting
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            print(f"Semantic Scholar API rate limited. Using mock data for testing.")
            return _get_mock_papers(topic, limit)
        else:
            raise Exception(f"API error: {str(e)}")
    except Exception as e:
        print(f"Semantic Scholar API error: {e}. Using mock data for testing.")
        return _get_mock_papers(topic, limit)

    if not data or "data" not in data:
        raise Exception("No data returned from API")

    papers = []
    for item in data.get("data", []):
        paper_id = item.get("paperId", "")
        authors = [a.get("name", "Unknown") for a in item.get("authors", [])]
        year = item.get("year") or 0

        papers.append({
            "id": paper_id,
            "title": item.get("title", "Untitled"),
            "authors": authors[:5],
            "year": year,
            "abstract": item.get("abstract", "") or item.get("tldr", {}).get("text", "") if item.get("tldr") else "No abstract available.",
            "citations": [c.get("paperId", "") for c in item.get("citations", [])[:10]],
            "references": [r.get("paperId", "") for r in item.get("references", [])[:10]],
            "keyConcepts": extract_key_concepts(item.get("title", ""), item.get("abstract", "")),
            "url": f"https://www.semanticscholar.org/paper/{paper_id}" if paper_id else "",
        })

    if not papers:
        raise Exception("No papers found for this topic. Try a different search term.")

    return papers


def _get_mock_papers(topic: str, limit: int = 15) -> List[Dict[str, Any]]:
    """Fallback mock data for when API is rate limited."""
    return [
        {
            "id": f"mock-{i}",
            "title": f"Mock Paper on {topic} #{i}",
            "authors": ["Author A", "Author B"],
            "year": 2023 - i,
            "abstract": f"This is a mock abstract for a paper about {topic}. It discusses various aspects of the field and proposes new methods.",
            "citations": [f"mock-{j}" for j in range(limit) if j != i][:3],
            "references": [f"mock-{j}" for j in range(limit) if j != i][:5],
            "keyConcepts": [topic.lower(), "research", "analysis", "methods"],
            "url": f"https://www.semanticscholar.org/search?q={topic}",
        }
        for i in range(limit)
    ]


def extract_key_concepts(title: str, abstract: str) -> List[str]:
    """Extract key concepts from title and abstract."""
    text = f"{title} {abstract}".lower()
    stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "this", "that", "these", "those", "it", "its", "we", "our", "you", "your", "they", "their", "he", "she", "as", "if", "when", "than", "so", "no", "not", "only", "also", "very", "just", "about", "over", "under", "between", "through", "during", "before", "after", "above", "below", "up", "down", "out", "off", "into", "onto", "upon", "within", "without", "across", "along", "around", "against", "toward", "towards", "among", "amid", "beside", "beyond", "near", "inside", "outside", "such", "more", "most", "other", "some", "any", "each", "every", "all", "both", "few", "many", "much", "several", "which", "who", "whom", "what", "where", "why", "how", "new", "using", "based", "study", "studies", "paper", "approach", "method", "results", "show", "shown", "propose", "proposed", "present", "presented", "analysis", "perform", "performed", "demonstrate", "demonstrated", "evaluate", "evaluated", "compare", "compared", "improve", "improved", "significant", "significantly"}

    words = text.split()
    concepts = {}
    for word in words:
        word = word.strip(".,;:!?()[]{}\"'")
        if len(word) > 3 and word not in stop_words:
            concepts[word] = concepts.get(word, 0) + 1

    sorted_concepts = sorted(concepts.items(), key=lambda x: x[1], reverse=True)
    return [c[0] for c in sorted_concepts[:8]]


def build_graph_edges(papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Build citation edges between papers using real citation data."""
    edges = []
    paper_ids = {p["id"] for p in papers if p.get("id")}

    for paper in papers:
        for ref_id in paper.get("references", []):
            if ref_id in paper_ids and ref_id != paper["id"]:
                edges.append({
                    "id": f"{paper['id']}-{ref_id}",
                    "source": paper["id"],
                    "target": ref_id,
                    "label": "cites",
                })

    return edges


def build_graph_nodes(papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Build graph nodes from papers with layout positions."""
    nodes = []
    n = len(papers)
    import math

    for i, paper in enumerate(papers):
        angle = (2 * math.pi * i) / n if n > 1 else 0
        radius = 300
        x = 400 + radius * math.cos(angle)
        y = 300 + radius * math.sin(angle)

        nodes.append({
            "id": paper["id"],
            "paperId": paper["id"],
            "x": x,
            "y": y,
            "label": paper["title"][:60] + ("..." if len(paper["title"]) > 60 else ""),
            "summary": paper.get("abstract", "")[:200] + "...",
            "year": paper.get("year", 0),
            "isCentral": i < 3,
            "authors": paper.get("authors", []),
            "url": paper.get("url", ""),
        })

    return nodes
