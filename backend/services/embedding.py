import os
import google.generativeai as genai
from typing import List

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings using Gemini text embedding model."""
    if not texts:
        return []

    result = genai.embed_content(
        model="models/gemini-embedding-2",
        content=texts,
    )

    embeddings = result["embedding"]
    if isinstance(embeddings, list) and len(embeddings) > 0 and isinstance(embeddings[0], list):
        return embeddings
    else:
        return [embeddings]
