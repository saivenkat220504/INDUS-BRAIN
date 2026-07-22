"""
PlantBrain Neo4j Client Service Manager
Handles Neo4j Aura database connection lifecycles, sessions, and transaction executions.
"""
from typing import Dict, Any, List, Optional
from neo4j import GraphDatabase, Driver
from app.config import settings

_driver_instance: Optional[Driver] = None


def get_neo4j_driver() -> Optional[Driver]:
    """Retrieve or initialize singleton Neo4j driver."""
    global _driver_instance
    if _driver_instance is not None:
        return _driver_instance

    if not settings.is_neo4j_configured():
        print("[Neo4j Client Warning]: Neo4j credentials not configured.")
        return None

    try:
        _driver_instance = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        )
        # Verify connection
        _driver_instance.verify_connectivity()
        print(f"[Neo4j Client]: Successfully connected to Neo4j database '{settings.NEO4J_DATABASE}' at '{settings.NEO4J_URI}'")
        return _driver_instance
    except Exception as err:
        print(f"[Neo4j Client Connection Error]: {err}")
        _driver_instance = None
        return None


def close_neo4j_driver() -> None:
    """Close active Neo4j driver connection."""
    global _driver_instance
    if _driver_instance:
        try:
            _driver_instance.close()
            print("[Neo4j Client]: Driver connection closed.")
        except Exception as e:
            print(f"[Neo4j Client Close Error]: {e}")
        _driver_instance = None


def execute_cypher_query(query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Execute Cypher read/write query against Neo4j database using parameterized transactions.
    """
    driver = get_neo4j_driver()
    if not driver:
        return []

    params = parameters or {}
    db_name = settings.NEO4J_DATABASE if settings.NEO4J_DATABASE else None

    try:
        with driver.session(database=db_name) as session:
            result = session.run(query, params)
            return [record.data() for record in result]
    except Exception as err:
        print(f"[Cypher Execution Error]: {err} | Query: {query}")
        return []
