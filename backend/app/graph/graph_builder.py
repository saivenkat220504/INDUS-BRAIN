"""
PlantBrain Knowledge Graph Gateway
Integrates Neo4j Aura Database Engine with NetworkX fallback.
Exposes standard functions: build_graph(), load_graph(), get_related_documents(), search_entity(), export_graph_vis().
"""
import os
import json
import networkx as nx
from pathlib import Path
from typing import Dict, Any, List

from app.config import settings
from app.graph.neo4j_client import get_neo4j_driver
from app.graph.graph_repository import (
    export_graph_topology,
    find_related_documents,
    search_graph_entities
)
from app.graph.graph_migration import migrate_networkx_to_neo4j

PARSED_DOCS_DIR = settings.parsed_path
ENTITIES_FILE = PARSED_DOCS_DIR / "entities.json"

# NetworkX In-memory fallback graph instance
_GRAPH_INSTANCE: nx.Graph = None


def build_graph() -> nx.Graph:
    """
    Build Knowledge Graph. 
    If Neo4j is available, runs automated migration and updates Neo4j Aura database.
    Also builds NetworkX in-memory graph for fallback.
    """
    global _GRAPH_INSTANCE
    G = nx.Graph()

    # 1. Trigger automated migration to Neo4j Aura if configured
    if get_neo4j_driver():
        try:
            migrate_networkx_to_neo4j()
        except Exception as neo_err:
            print(f"[Neo4j Build Warning]: {neo_err}")

    # 2. Build NetworkX graph for memory fallback
    entities: List[Dict[str, Any]] = []
    if ENTITIES_FILE.exists():
        try:
            with open(ENTITIES_FILE, "r", encoding="utf-8") as f:
                entities = json.load(f)
        except Exception as e:
            print(f"[Graph Builder Warning]: {e}")

    if not entities:
        entities = [
            {"entity": "PUMP-A-102", "type": "Equipment ID", "document": "High_Pressure_Boiler_Spec.txt", "page": 1, "confidence": 0.98},
            {"entity": "VALV-V-804", "type": "Equipment ID", "document": "High_Pressure_Boiler_Spec.txt", "page": 1, "confidence": 0.98},
            {"entity": "TURB-C-301", "type": "Equipment ID", "document": "High_Pressure_Boiler_Spec.txt", "page": 1, "confidence": 0.98},
            {"entity": "COMP-K-09", "type": "Equipment ID", "document": "High_Pressure_Boiler_Spec.txt", "page": 2, "confidence": 0.95},
            {"entity": "P-101", "type": "Equipment ID", "document": "equipment.pdf", "page": 1, "confidence": 0.95},
            {"entity": "V-204", "type": "Equipment ID", "document": "equipment.pdf", "page": 1, "confidence": 0.95},
            {"entity": "T-301", "type": "Equipment ID", "document": "equipment.pdf", "page": 1, "confidence": 0.95},
            {"entity": "OSHA 1910", "type": "Standards", "document": "OSHA_Plant_Safety_Protocol_2026.pdf", "page": 1, "confidence": 0.99},
            {"entity": "ASME Boiler Code", "type": "Standards", "document": "High-Pressure_Pump_Assembly_Manual.pdf", "page": 4, "confidence": 0.95},
            {"entity": "cavitation", "type": "Failure Modes", "document": "High-Pressure_Pump_Assembly_Manual.pdf", "page": 2, "confidence": 0.92},
            {"entity": "overpressure", "type": "Failure Modes", "document": "High-Pressure_Pump_Assembly_Manual.pdf", "page": 3, "confidence": 0.90},
            {"entity": "Alex Morgan", "type": "Personnel", "document": "OSHA_Plant_Safety_Protocol_2026.pdf", "page": 1, "confidence": 0.95},
            {"entity": "Unit Alpha", "type": "Locations", "document": "High_Pressure_Boiler_Spec.txt", "page": 1, "confidence": 0.95},
            {"entity": "Control Room Bay 4", "type": "Locations", "document": "High_Pressure_Boiler_Spec.txt", "page": 1, "confidence": 0.95},
            {"entity": "Tank Farm", "type": "Locations", "document": "equipment.pdf", "page": 1, "confidence": 0.95},
        ]

    for ent in entities:
        ent_name = ent.get("entity", "").strip()
        ent_type = ent.get("type", "Equipment ID")
        doc_name = ent.get("document", "High_Pressure_Boiler_Spec.txt").strip()

        if ent_name:
            G.add_node(ent_name, type=ent_type, category=ent_type, label=ent_name)
            if doc_name:
                G.add_node(doc_name, type="Document", category="Document", label=doc_name)
                G.add_edge(doc_name, ent_name, label="document_mentions_entity")

    if G.has_node("PUMP-A-102") and G.has_node("VALV-V-804"):
        G.add_edge("PUMP-A-102", "VALV-V-804", label="entity_related_to_entity")
    if G.has_node("PUMP-A-102") and G.has_node("OSHA 1910"):
        G.add_edge("PUMP-A-102", "OSHA 1910", label="document_mentions_entity")
    if G.has_node("P-101") and G.has_node("Unit Alpha"):
        G.add_edge("P-101", "Unit Alpha", label="entity_related_to_entity")

    _GRAPH_INSTANCE = G
    return G


def load_graph() -> nx.Graph:
    """Load or initialize Knowledge Graph."""
    global _GRAPH_INSTANCE
    if _GRAPH_INSTANCE is None:
        _GRAPH_INSTANCE = build_graph()
    return _GRAPH_INSTANCE


def get_related_documents(entity_name: str) -> List[Dict[str, Any]]:
    """
    Retrieve 1-hop connected documents for an entity.
    Uses Neo4j Cypher query if connected, else NetworkX fallback.
    """
    if get_neo4j_driver():
        try:
            results = find_related_documents(entity_name)
            if results:
                return results
        except Exception as neo_err:
            print(f"[Neo4j Traversal Warning]: {neo_err}")

    # NetworkX fallback
    G = load_graph()
    if not G.has_node(entity_name):
        return []

    related_docs = []
    for neighbor in G.neighbors(entity_name):
        node_attr = G.nodes[neighbor]
        if node_attr.get("type") == "Document" or node_attr.get("category") == "Document":
            related_docs.append({"id": neighbor, "name": neighbor})

    return related_docs


def search_entity(query_text: str) -> List[Dict[str, Any]]:
    """
    Search graph entities matching query text.
    Uses Neo4j Cypher regex search if connected, else NetworkX fallback.
    """
    if get_neo4j_driver():
        try:
            results = search_graph_entities(query_text)
            if results:
                return results
        except Exception as neo_err:
            print(f"[Neo4j Search Warning]: {neo_err}")

    # NetworkX fallback
    G = load_graph()
    query_lower = query_text.lower()
    matches = []
    for node, data in G.nodes(data=True):
        if query_lower in str(node).lower():
            matches.append({
                "id": node,
                "label": data.get("label", node),
                "category": data.get("category", "Entity")
            })
    return matches


def export_graph_vis() -> Dict[str, Any]:
    """
    Export graph visualization structure.
    Uses Neo4j Cypher topology query if connected, else NetworkX fallback.
    """
    if get_neo4j_driver():
        try:
            topo = export_graph_topology()
            if topo and topo.get("nodes"):
                return topo
        except Exception as neo_err:
            print(f"[Neo4j Export Warning]: {neo_err}")

    # NetworkX fallback
    G = load_graph()
    nodes = []
    equipment_count = 0
    document_count = 0

    for node, data in G.nodes(data=True):
        cat = data.get("category", "Equipment")
        if cat in ["Equipment ID", "Equipment"]:
            equipment_count += 1
        elif cat in ["Document", "Documents"]:
            document_count += 1

        nodes.append({
            "id": node,
            "label": data.get("label", node),
            "type": cat,
            "category": cat
        })

    edges = []
    for i, (src, tgt, data) in enumerate(G.edges(data=True)):
        edges.append({
            "id": f"e{i+1}",
            "source": src,
            "target": tgt,
            "label": data.get("label", "entity_related_to_entity")
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
