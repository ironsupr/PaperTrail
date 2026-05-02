import httpx
import json

def test_search():
    url = "http://127.0.0.1:8000/api/search_papers"
    data = {"topic": "Quantum Computing"}
    try:
        response = httpx.post(url, json=data, timeout=60.0)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search()
