from typing import List, Dict


def analyze_graph_structure(nodes: List[Dict], edges: List[Dict]) -> Dict:
    """Analyze the graph for structural patterns."""
    node_ids = {n["id"] for n in nodes}

    citation_counts = {}
    for edge in edges:
        target = edge.get("target", "")
        citation_counts[target] = citation_counts.get(target, 0) + 1

    most_cited = sorted(citation_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    most_cited_ids = {mc[0] for mc in most_cited}

    for node in nodes:
        if node["id"] in most_cited_ids:
            node["isCentral"] = True

    isolated_nodes = [
        n["id"] for n in nodes
        if n["id"] not in {e["source"] for e in edges} and n["id"] not in {e["target"] for e in edges}
    ]

    clusters = detect_clusters(nodes, edges)

    return {
        "total_papers": len(nodes),
        "total_connections": len(edges),
        "most_cited": most_cited,
        "isolated_papers": isolated_nodes,
        "clusters": clusters,
        "avg_citations": len(edges) / max(len(nodes), 1),
    }


def detect_clusters(nodes: List[Dict], edges: List[Dict]) -> List[Dict]:
    """Simple cluster detection based on connectivity."""
    adjacency = {}
    for node in nodes:
        adjacency[node["id"]] = set()

    for edge in edges:
        src = edge.get("source", "")
        tgt = edge.get("target", "")
        if src in adjacency and tgt in adjacency:
            adjacency[src].add(tgt)
            adjacency[tgt].add(src)

    visited = set()
    clusters = []

    for node_id in adjacency:
        if node_id not in visited:
            cluster = bfs(node_id, adjacency, visited)
            if len(cluster) > 1:
                cluster_nodes = [n for n in nodes if n["id"] in cluster]
                clusters.append({
                    "size": len(cluster),
                    "papers": [n["label"] for n in cluster_nodes[:5]],
                })

    return clusters


def bfs(start: str, adjacency: Dict, visited: set) -> set:
    """Breadth-first search to find connected component."""
    queue = [start]
    component = set()

    while queue:
        node = queue.pop(0)
        if node in visited:
            continue
        visited.add(node)
        component.add(node)
        for neighbor in adjacency.get(node, set()):
            if neighbor not in visited:
                queue.append(neighbor)

    return component
