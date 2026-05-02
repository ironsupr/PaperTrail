import warnings
warnings.filterwarnings('ignore')
import fitz
from services.pdf_parser import parse_pdf
import asyncio
import os

async def test():
    # Create test PDF with citations
    doc = fitz.open()
    page = doc.new_page()
    text = '''Machine Learning Research
    
    Abstract: This paper discusses ML.
    
    References:
    [1] John Doe, Jane Smith (2023) Deep Learning Methods. Journal of AI.
    [2] Bob Wilson et al. (2022) Neural Networks Today. ML Review.
    [3] Alice Brown (2021) Transformer Models. AI Conference.
    '''
    page.insert_text((50, 50), text)
    doc.save('test_citations.pdf')
    doc.close()
    
    # Parse it
    result = await parse_pdf('test_citations.pdf')
    print(f'Title: {result["title"]}')
    print(f'Citations extracted: {len(result.get("citations", []))}')
    for i, cit in enumerate(result.get('citations', [])[:3]):
        print(f'{i+1}. Title: {cit.get("title", "No title")}')
        print(f'   Authors: {cit.get("authors", [])}')
        print(f'   Year: {cit.get("year", "Unknown")}')
        print(f'   Text: {cit.get("text", "")[:80]}')
    
    if os.path.exists('test_citations.pdf'):
        os.remove('test_citations.pdf')

asyncio.run(test())
