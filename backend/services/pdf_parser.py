import fitz  # PyMuPDF
from typing import List, Dict, Optional
import re


async def parse_pdf(file_path: str) -> Dict:
    """Parse PDF using PyMuPDF and extract text, metadata, structure, and citations."""
    doc = fitz.open(file_path)

    text_content = []
    metadata = doc.metadata
    total_pages = len(doc)

    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text()
        text_content.append({
            "page": page_num + 1,
            "text": text,
        })

    full_text = "\n".join(tc["text"] for tc in text_content)

    title = extract_title(full_text)
    abstract = extract_abstract(full_text)
    citations = extract_citations(full_text)

    doc.close()

    return {
        "title": title,
        "abstract": abstract,
        "full_text": full_text,
        "pages": total_pages,
        "citations": citations,
        "metadata": {
            "author": metadata.get("author", ""),
            "title": metadata.get("title", title),
            "subject": metadata.get("subject", ""),
        },
    }


def extract_title(text: str) -> str:
    """Extract title from PDF text."""
    lines = text.strip().split("\n")
    for line in lines[:10]:
        line = line.strip()
        if line and len(line) > 10 and len(line) < 200:
            return line
    return "Untitled Paper"


def extract_abstract(text: str) -> str:
    """Extract abstract from PDF text."""
    lower_text = text.lower()
    abstract_start = lower_text.find("abstract")
    if abstract_start == -1:
        abstract_start = lower_text.find("summary")
    if abstract_start == -1:
        return text[:500]

    start = abstract_start + len("abstract")
    remaining = text[start:start + 2000]

    keywords = ["introduction", "1.", "background", "related work", "keywords"]
    for kw in keywords:
        idx = remaining.lower().find(kw)
        if idx > 50:
            remaining = remaining[:idx]

    return remaining.strip()


def extract_citations(text: str) -> List[Dict[str, str]]:
    """Extract citations and references from PDF text."""
    citations = []

    # Common citation patterns - extract FULL citation text including title
    # Pattern captures: [num] authors (year) titlerest
    patterns = [
        r'\[(\d+)\]\s+(.+?)\s+\((\d{4})\)\s*(.+?)(?:\.\s+[A-Z]|\n|$)',  # [1] Authors (2023) Title. Journal
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+et\s+al\.?)\s*\((\d{4})\)\s*(.+?)(?:\.|$)',  # Author et al. (2023) Title
        r'\((\d{4})\)\s*([A-Z][a-z]+(?:\s+and\s+[A-Z][a-z]+)?)\s*(.+?)(?:\.|$)',  # (2023) Author Title
    ]

    for pattern in patterns:
        matches = re.finditer(pattern, text)
        for match in matches:
            full_text = match.group(0).strip()
            
            if pattern.startswith(r'\['):
                # [1] Authors (2023) Title format
                # Groups: 1=num, 2=authors, 3=year, 4=title
                authors_raw = match.group(2).strip() if match.lastindex >= 2 else ""
                authors = [a.strip() for a in authors_raw.split(',') if a.strip()] if authors_raw else ["Unknown"]
                title = match.group(4).strip() if match.lastindex >= 4 else ""
                citations.append({
                    "id": match.group(1),
                    "text": full_text,
                    "year": match.group(3),
                    "title": title[:200] if title else extract_paper_title(full_text),
                    "authors": authors,
                })
            elif "et al" in pattern:
                # Author et al. (2023) Title format
                # Groups: 1=authors et al., 2=year, 3=title
                title = match.group(3).strip() if match.lastindex >= 3 else ""
                citations.append({
                    "id": "",
                    "text": full_text,
                    "year": match.group(2),
                    "title": title[:200] if title else "",
                    "authors": [match.group(1).strip()],
                })
            else:
                # (2023) Author Title format
                # Groups: 1=year, 2=author, 3=title
                title = match.group(3).strip() if match.lastindex >= 3 else ""
                author = match.group(2).strip() if match.lastindex >= 2 else ""
                citations.append({
                    "id": "",
                    "text": full_text,
                    "year": match.group(1),
                    "title": title[:200] if title else "",
                    "authors": [author] if author else ["Unknown"],
                })

    # Also extract from References section
    ref_section = extract_reference_section(text)
    citations.extend(ref_section)

    # Deduplicate based on citation text
    seen_texts = set()
    unique_citations = []
    for cit in citations:
        text_key = cit.get("text", "")[:100].lower()
        if text_key and text_key not in seen_texts:
            seen_texts.add(text_key)
            unique_citations.append(cit)
    
    return unique_citations  # Return deduplicated citations


def extract_paper_title(citation_text: str) -> str:
    """Extract paper title from citation text like '[1] Author (2023) Title. Journal'."""
    # Pattern: after year, before period or journal info
    # [1] Author (2023) Title. Journal -> extract "Title"
    match = re.search(r'\(\d{4}\)\s*([^.]+)', citation_text)
    if match:
        title = match.group(1).strip()
        # Remove trailing punctuation
        title = re.sub(r'[.,;]$', '', title)
        return title[:200]
    
    # Try pattern with quotes
    quote_match = re.search(r'"([^"]+)"', citation_text)
    if quote_match:
        return quote_match.group(1).strip()
    
    return ""


def extract_authors_from_citation(citation_text: str) -> List[str]:
    """Extract author names from citation text."""
    # Pattern: Authors are before the year (YYYY)
    # "[1] John Doe, Jane Smith (2023) ..." -> extract "John Doe, Jane Smith"
    
    # Find year pattern
    year_match = re.search(r'\(\d{4}\)', citation_text)
    if not year_match:
        return ["Unknown"]
    
    # Get text before the year
    before_year = citation_text[:year_match.start()].strip()
    
    # Remove citation number if present like "[1] "
    before_year = re.sub(r'^\[\d+\]\s*', '', before_year).strip()
    
    # Split by comma to get individual authors
    if ',' in before_year:
        authors = [a.strip() for a in before_year.split(',') if a.strip()]
        return authors[:5]
    
    # Single author
    if before_year:
        return [before_year]
    
    return ["Unknown"]


def extract_reference_section(text: str) -> List[Dict[str, str]]:
    """Extract references from the References section."""
    references = []
    lower_text = text.lower()

    # Find References section
    ref_start = -1
    for keyword in ["references", "bibliography", "works cited"]:
        idx = lower_text.find(keyword)
        if idx > 0 and (idx < ref_start or ref_start == -1):
            ref_start = idx

    if ref_start == -1:
        return references

    # Get text after References
    ref_text = text[ref_start:ref_start + 5000]

    # Extract individual references (usually start with [number] or Author name)
    lines = ref_text.split("\n")
    current_ref = ""

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # New reference starts
        if re.match(r'^\[\d+\]', line) or (len(line) > 20 and len(line) < 200):
            if current_ref:
                references.append({
                    "id": "",
                    "text": current_ref,
                    "year": extract_year(current_ref),
                })
            current_ref = line
        else:
            current_ref += " " + line

    if current_ref:
        references.append({
            "id": "",
            "text": current_ref,
            "year": extract_year(current_ref),
        })

    return references[:15]


def extract_year(text: str) -> str:
    """Extract year from text."""
    match = re.search(r'\b(\d{4})\b', text)
    return match.group(1) if match else ""


def extract_key_sections(text: str) -> List[Dict]:
    """Extract key sections from PDF."""
    sections = []
    section_patterns = [
        "introduction",
        "related work",
        "methodology",
        "method",
        "approach",
        "experiment",
        "results",
        "discussion",
        "conclusion",
        "future work",
    ]

    lines = text.split("\n")
    current_section = None
    current_content = []

    for line in lines:
        stripped = line.strip().lower()
        for pattern in section_patterns:
            if pattern in stripped and len(stripped) < 50:
                if current_section:
                    sections.append({
                        "heading": current_section,
                        "content": "\n".join(current_content),
                    })
                current_section = line.strip()
                current_content = []
                break
        else:
            if current_section:
                current_content.append(line)

    if current_section:
        sections.append({
            "heading": current_section,
            "content": "\n".join(current_content),
        })

    return sections
