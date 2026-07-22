"""
PlantBrain Neo4j Graph Repository
Encapsulates all Cypher queries for node/relationship CRUD, index initialization, and topology exports.
"""
from typing import Dict, Any, List, Optional
from app.graph.neo4j_client import execute_cypher_query


def init_graph_indexes_and_constraints() -> None:
    """Initialize Neo4j indexes and constraints for optimized Cypher queries."""
    # Create uniqueness constraint on Node(id)
    cypher_constraint = """
    CREATE CONSTRAINT node_id_unique IF NOT EXISTS
    FOR (n:PlantNode) REQUIRE n.id IS UNIQUE
    """
    execute_cypher_query(cypher_constraint)

    # Create index on label and category
    cypher_idx_label = """
    CREATE INDEX node_label_idx IF NOT EXISTS
    FOR (n:PlantNode) ON (n.label)
    """
    execute_cypher_query(cypher_idx_label)


def upsert_graph_node(node_id: str, label: str, category: str, extra_props: Optional[Dict[str, Any]] = None) -> bool:
    """
    Upsert node using Cypher MERGE to prevent duplicate node creation.
    """
    if not node_id:
        return False

    # Map category to dynamic Neo4j label
    clean_cat_label = category.replace(" ", "") if category else "PlantEntity"
    if clean_cat_label not in ["Document", "Equipment", "Standard", "FailureMode", "Location", "Personnel", "Date"]:
        clean_cat_label = "PlantEntity"

    query = f"""
    MERGE (n:PlantNode {{id: $node_id}})
    SET n:{clean_cat_label},
        n.label = $label,
        n.category = $category,
        n.type = $category
    """
    props = extra_props or {}
    params = {
        "node_id": str(node_id),
        "label": str(label),
        "category": str(category)
    }

    if props:
        query += "\nSET n += $extra_props"
        params["extra_props"] = props

    res = execute_cypher_query(query, params)
    return True


def upsert_graph_relationship(source_id: str, target_id: str, rel_type: str, extra_props: Optional[Dict[str, Any]] = None) -> bool:
    """
    Upsert relationship between source and target nodes using Cypher MERGE.
    """
    if not source_id or not target_id:
        return False

    # Normalize relationship type
    clean_rel_type = rel_type.strip() if rel_type else "entity_related_to_entity"
    if clean_rel_type not in ["document_mentions_entity", "entity_related_to_entity", "entity_co_occurs"]:
        clean_rel_type = "entity_related_to_entity"

    query = f"""
    MATCH (a:PlantNode {{id: $source_id}})
    MATCH (b:PlantNode {{id: $target_id}})
    MERGE (a)-[r:{clean_rel_type}]->(b)
    """
    params = {
        "source_id": str(source_id),
        "target_id": str(target_id)
    }

    if extra_props:
        query += "\nSET r += $extra_props"
        params["extra_props"] = extra_props

    execute_cypher_query(query, params)
    return True


def export_graph_topology() -> Dict[str, Any]:
    """
    Cypher query retrieving all nodes and edges formatted for React Flow canvas.
    Returns { nodes: [...], edges: [...], stats: {...} }.
    """
    nodes_query = """
    MATCH (n:PlantNode)
    RETURN n.id AS id, n.label AS label, n.category AS category, labels(n) AS neo_labels
    """
    raw_nodes = execute_cypher_query(nodes_query)

    edges_query = """
    MATCH (a:PlantNode)-[r]->(b:PlantNode)
    RETURN a.id AS source, b.id AS target, type(r) AS label
    """
    raw_edges = execute_cypher_query(edges_query)

    nodes = []
    equipment_count = 0
    document_count = 0

    for idx, r in enumerate(raw_nodes):
        cat = r.get("category") or "Equipment"
        if cat in ["Equipment ID", "Equipment"]:
            equipment_count += 1
        elif cat in ["Document", "Documents"]:
            document_count += 1

        nodes.append({
            "id": r.get("id"),
            "label": r.get("label") or r.get("id"),
            "type": cat,
            "category": cat
        })

    edges = []
    for idx, e in enumerate(raw_edges):
        edges.append({
            "id": f"e{idx + 1}",
            "source": e.get("source"),
            "target": e.get("target"),
            "label": e.get("label") or "entity_related_to_entity"
        })

    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "equipment_nodes": equipment_count,
            "document_nodes": document_count
        }
    }


def find_related_documents(entity_name: str) -> List[Dict[str, Any]]:
    """
    1-hop Cypher traversal returning matching Document nodes connected to target entity.
    """
    query = """
    MATCH (e:PlantNode {id: $entity_name})-[*1..2]-(d:PlantNode)
    WHERE d.category = 'Document' OR d:Document
    RETURN DISTINCT d.id AS id, d.label AS name, d.category AS category
    """
    results = execute_cypher_query(query, {"entity_name": entity_name})
    return [{"id": r.get("id"), "name": r.get("name") or r.get("id")} for r in results]


def search_graph_entities(query_text: str) -> List[Dict[str, Any]]:
    """
    Cypher substring search across node labels.
    """
    query = """
    MATCH (n:PlantNode)
    WHERE toLower(n.label) CONTAINS toLower($query_text) OR toLower(n.id) CONTAINS toLower($query_text)
    RETURN n.id AS id, n.label AS label, n.category AS category
    LIMIT 20
    """
    results = execute_cypher_query(query, {"query_text": query_text})
    return results
