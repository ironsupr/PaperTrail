import warnings
warnings.filterwarnings('ignore')

from fastapi.testclient import TestClient
import main

client = TestClient(main.app)

print("Testing backend endpoints...")
print("=" * 50)

# Test health
r = client.get('/api/health')
print(f"Health: {r.status_code} - {r.json()}")

# Test search
r = client.post('/api/search_papers', json={'topic': 'test'})
print(f"Search: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"Got {len(data.get('papers', []))} papers")
    print("Search SUCCESS!")
else:
    print(f"Error: {r.text[:500]}")
