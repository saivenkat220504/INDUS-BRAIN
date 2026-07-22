"""
PlantBrain FastAPI Application Entrypoint
"""
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime

from app.api.routes import router as api_router
from app.database.session import engine, Base

from app.config import settings

app = FastAPI(
    title="PlantBrain API",
    description="Enterprise Industrial AI Knowledge & Compliance Engine",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API sub-routers
app.include_router(api_router)


from app.api.routes import ensure_all_files_ingested

@app.on_event("startup")
def startup_event():
    """FastAPI startup verification event."""
    print("=" * 60)
    print("🌿🧠 PLANTBRAIN INDUSTRIAL AI ENGINE INITIALIZATION")
    print("=" * 60)

    # 1. Verify and create storage directories
    settings.ensure_directories()
    print(f"[Storage check]: OK -> Uploads: '{settings.UPLOAD_DIR}', Parsed: '{settings.PARSED_DIR}', Vector DB: '{settings.VECTOR_DB_DIR}'")

    # 2. Ingest any pending uploaded files & create ChromaDB vector embeddings
    try:
        ensure_all_files_ingested()
        print(f"[Vector DB & Graph Indexing]: OK -> Ingested and indexed uploaded documents.")
    except Exception as ing_err:
        print(f"[Vector DB & Graph Indexing Warning]: {ing_err}")

    # 3. Verify Database initialization
    try:
        Base.metadata.create_all(bind=engine)
        print(f"[Database check]: OK -> Connected to '{settings.DATABASE_URL}'")
    except Exception as db_err:
        print(f"[Database check]: ERROR -> {db_err}")

    # 4. Verify Neo4j Aura Database Connection & Ingestion
    if settings.is_neo4j_configured():
        from app.graph.neo4j_client import get_neo4j_driver
        from app.graph.graph_migration import migrate_networkx_to_neo4j
        if get_neo4j_driver():
            try:
                migrate_networkx_to_neo4j()
                print(f"[Neo4j Check]: OK -> Connected and migrated to Neo4j Aura Database ({settings.NEO4J_URI})")
            except Exception as neo_mig_err:
                print(f"[Neo4j Migration Warning]: {neo_mig_err}")
    else:
        print(f"[Neo4j Check]: WARNING -> Neo4j parameters not set. NetworkX memory fallback active.")

    # 5. Verify Gemini API Key configuration
    if settings.is_gemini_configured():
        print(f"[Gemini API check]: OK -> Gemini API Key configured.")
    else:
        print(f"[Gemini API check]: WARNING -> GEMINI_API_KEY is not configured or using default template. RAG fallback active.")


    print("=" * 60)
    print("🚀 PlantBrain FastAPI Server Ready at http://localhost:8000")
    print("=" * 60)



@app.get("/")
def read_root():
    """Root status endpoint for service verification."""
    return {
        "project": "PlantBrain Engine",
        "status": "ONLINE",
        "architecture": "Full-Stack AI Industrial System",
        "docs": "/docs",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "database": "connected",
        "ingestion_service": "ready",
        "graph_engine": "ready",
        "compliance_engine": "ready",
        "uptime": "operational"
    }


from app.api.routes import (
    upload_documents as process_upload_docs,
    download_document as process_download_doc,
    get_graph,
    get_graph_entity,
    search_graph,
    list_documents,
    chat_copilot,
    get_compliance_audit,
    ChatRequest
)

@app.get("/download/{filename}")
def root_download_document(filename: str):
    """Direct GET /download/{filename} endpoint to download file from storage/uploads/."""
    return process_download_doc(filename)


@app.post("/upload")

async def root_upload_documents(
    files: List[UploadFile] = File(None),
    file: UploadFile = File(None)
):
    """Direct POST /upload endpoint for storing files into storage/uploads/."""
    return await process_upload_docs(files=files, file=file)


@app.post("/chat")
def root_chat_copilot(req: ChatRequest):
    """Direct POST /chat endpoint for AI Copilot RAG pipeline."""
    return chat_copilot(req)


@app.get("/compliance")
def root_get_compliance_audit():
    """Direct GET /compliance endpoint for regulatory rules audit."""
    return get_compliance_audit()


@app.get("/graph")
def root_get_graph():
    """Direct GET /graph endpoint for React Flow/Vis.js graph visualization."""
    return get_graph()


@app.get("/graph/entity/{name}")
def root_get_graph_entity(name: str):
    """Direct GET /graph/entity/{name} endpoint."""
    return get_graph_entity(name)


@app.get("/graph/search")
def root_search_graph(query: str = ""):
    """Direct GET /graph/search endpoint."""
    return search_graph(query)


from app.api.routes import (
    get_debug_status,
    get_debug_vector_count,
    get_debug_parsed_documents,
    get_debug_chunks,
    get_debug_retrieval,
    post_debug_reset_vector_db,
    get_debug_context,
    get_debug_pipeline
)

@app.get("/debug/status")
def root_debug_status():
    return get_debug_status()

@app.get("/debug/vector-count")
def root_debug_vector_count():
    return get_debug_vector_count()

@app.get("/debug/parsed")
def root_debug_parsed():
    return get_debug_parsed_documents()

@app.get("/debug/chunks")
def root_debug_chunks():
    return get_debug_chunks()

@app.get("/debug/retrieval")
def root_debug_retrieval(question: str = "Pump", top_k: int = 5):
    return get_debug_retrieval(question=question, top_k=top_k)

@app.post("/debug/reset-vector-db")
def root_debug_reset_vector_db():
    return post_debug_reset_vector_db()

@app.get("/debug/context")
def root_debug_context(question: str = "Summarize this document"):
    return get_debug_context(question=question)

@app.get("/debug/pipeline")
def root_debug_pipeline():
    return get_debug_pipeline()




@app.get("/documents")
def root_list_documents():
    """Direct GET /documents endpoint."""
    return list_documents()



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
