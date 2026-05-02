import chromadb
from typing import List, Dict
from services.embedding import generate_embeddings


class NoveltyGuard:
    """ChromaDB-based novelty checking system."""

    def __init__(self):
        self.client = chromadb.Client()
        self.collection = self.client.get_or_create_collection(
            name="paper_embeddings",
            metadata={"hnsw:space": "cosine"}
        )

    async def add_papers(self, papers: List[Dict]):
        """Add papers to the vector store."""
        texts = [
            f"{p['title']} {p.get('abstract', '')}"
            for p in papers
        ]

        embeddings = await generate_embeddings(texts)

        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            ids=[p["id"] for p in papers],
            metadatas=[
                {"title": p["title"], "year": p.get("year", 0)}
                for p in papers
            ],
        )

    async def check_novelty(
        self,
        title: str,
        abstract: str,
        contributions: List[str],
        existing_papers: List[Dict],
    ) -> Dict:
        """Check novelty of an idea against stored papers."""
        query_text = f"{title} {abstract} {' '.join(contributions)}"

        query_embedding = await generate_embeddings([query_text])

        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=min(10, self.collection.count()),
            include=["documents", "distances", "metadatas"],
        )

        similar_papers = []
        if results["distances"] and results["distances"][0]:
            for i, dist in enumerate(results["distances"][0]):
                similarity = max(0, 1 - dist)
                if similarity > 0.3:
                    similar_papers.append({
                        "title": results["metadatas"][0][i].get("title", "Unknown"),
                        "similarity": round(similarity, 3),
                        "abstract": results["documents"][0][i][:200] if results["documents"] else "",
                    })

        similar_papers.sort(key=lambda x: x["similarity"], reverse=True)

        max_similarity = max([sp["similarity"] for sp in similar_papers], default=0)

        novelty_score = max(0, min(100, int((1 - max_similarity) * 100)))
        rejection_prob = min(100, int(max_similarity * 100))

        if novelty_score >= 70:
            risk_level = "Low"
        elif novelty_score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "High"

        return {
            "noveltyScore": novelty_score,
            "rejectionProbability": rejection_prob,
            "riskLevel": risk_level,
            "similarPapers": similar_papers[:5],
        }


novelty_guard = NoveltyGuard()
