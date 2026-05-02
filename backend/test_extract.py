import warnings
warnings.filterwarnings('ignore')
import asyncio
import sys
sys.path.insert(0, '.')
from services.pdf_parser import extract_citations, extract_paper_title, extract_authors_from_citation

test_text = '''
References:
[1] John Doe, Jane Smith (2023) Deep Learning Methods. Journal of AI.
[2] Bob Wilson et al. (2022) Neural Networks Today. ML Review.
[3] Alice Brown (2021) Transformer Models. AI Conference.
'''

print("Testing extract_paper_title:")
print(f"  Test 1: {extract_paper_title('[1] John Doe, Jane Smith (2023) Deep Learning Methods. Journal')}")
print(f"  Test 2: {extract_paper_title('Bob Wilson et al. (2022) Neural Networks Today. ML Review')}")

print("\nTesting extract_authors_from_citation:")
print(f"  Test 1: {extract_authors_from_citation('[1] John Doe, Jane Smith (2023) Deep Learning Methods')}")
print(f"  Test 2: {extract_authors_from_citation('Bob Wilson et al. (2022) Neural Networks Today')}")

print("\nTesting extract_citations:")
citations = extract_citations(test_text)
print(f"Found {len(citations)} citations:")
for i, c in enumerate(citations[:5]):
    print(f'{i+1}. ID: {c.get("id")}, Year: {c.get("year")}')
    print(f'   Title: {c.get("title", "")}')
    print(f'   Authors: {c.get("authors", [])}')
    print(f'   Text: {c.get("text", "")[:80]}')
