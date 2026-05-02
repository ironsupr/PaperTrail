import requests
import json

url = "http://localhost:8000/api/parse_pdf"
files = {"file": open("test_paper.pdf", "rb")}
response = requests.post(url, files=files)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Title: {data.get('title')}")
    print(f"Citations count: {len(data.get('citations', []))}")
    print("First 5 citations:")
    for i, cit in enumerate(data.get("citations", [])[:5]):
        print(f"  {i+1}. {cit.get('title')} ({cit.get('year')})")
        print(f"     Authors: {cit.get('authors', [])}")
        print(f"     Text: {cit.get('text', '')[:80]}")
else:
    print(f"Error: {response.text[:500]}")
