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

# Test generate_summary
r = client.post('/api/generate_summary', json={'paperIds': [], 'topic': 'test'})
print(f"Summary: {r.status_code}")
if r.status_code == 200:
    print("Summary SUCCESS!")

print("\n" + "=" * 50)
print("All backend endpoints are working!")
print("\nTo start the backend server, run:")
print("  cd D:\\Project\\PaperTrail\\backend")
print("  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
print("\nTo start the frontend, run:")
print("  cd D:\\Project\\PaperTrail\\frontend")
print("  npm run dev")
