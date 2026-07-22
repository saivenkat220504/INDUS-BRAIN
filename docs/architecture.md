# PlantBrain (INDUS-BRAIN) — System Architecture Blueprint 🌿🧠⚡

```mermaid
flowchart TB
    %% ==========================================
    %% 1. USER & FRONTEND TIER
    %% ==========================================
    subgraph UI["🖥️ USER INTERFACE TIER (React + Vite SPA)"]
        direction TB
        Dash["📊 Dashboard (Metrics & Sensors)"]
        Upload["📤 Document Upload Dropzone"]
        KGVis["🕸️ Knowledge Graph Canvas (Vis.js / React Flow)"]
        ChatUI["💬 AI Copilot RAG Chat Interface"]
        CompUI["⚖️ Compliance & Audit Inspector"]
        DebugUI["🛠️ Pipeline Debug Telemetry"]
    end

    %% ==========================================
    %% 2. API GATEWAY TIER
    %% ==========================================
    subgraph GATEWAY["🚀 API GATEWAY TIER (FastAPI Microservice)"]
        direction TB
        APIRouter["🔀 APIRouter (/api/v1)"]
        AuthConf["⚙️ Secure Config (Pydantic Settings)"]
        DebugEndpoints["🛠️ Debug REST Endpoints (/debug/*)"]
    end

    %% ==========================================
    %% 3. DOCUMENT INGESTION & PARSING ENGINE
    %% ==========================================
    subgraph PARSING["📄 MULTIMODAL INGESTION & PARSING ENGINE"]
        direction TB
        PyMuPDF["⚡ PyMuPDF (fitz) - High Speed PDF Extractor"]
        PDFPlumber["📊 pdfplumber - Tabular Data Extractor"]
        TesseractOCR["📷 Tesseract OCR - Blueprint & Image Extractor"]
        ParsedJSON["💾 Parsed JSON Storage (storage/parsed_docs/*.json)"]
    end

    %% ==========================================
    %% 4. VECTOR DB & EMBEDDINGS SUBSYSTEM
    %% ==========================================
    subgraph VECTRAP["🔎 VECTOR DB & EMBEDDING SUBSYSTEM"]
        direction TB
        Chunker["✂️ 500-Word Sliding Window Chunker"]
        Embedder["🧠 SentenceTransformers (all-MiniLM-L6-v2)"]
        ChromaStore["📦 ChromaDB Vector Store (storage/chroma_db)"]
        FilenameFilter["🎯 Filename-Aware Vector Filter"]
    end

    %% ==========================================
    %% 5. NEO4J CLOUD GRAPH DATABASE ENGINE
    %% ==========================================
    subgraph GRAPH["🕸️ NEO4J CLOUD GRAPH DATABASE ENGINE"]
        direction TB
        NeoDriver["🔌 Neo4j Python Driver Manager (neo4j_client.py)"]
        CypherRepo["⚡ Cypher Query Repository (graph_repository.py)"]
        Migrator["🔄 Automated Migration Engine (graph_migration.py)"]
        
        subgraph NEO_CLOUD["☁️ Neo4j Aura Cloud Database (neo4j+s://...)"]
            Nodes["Nodes: Document, Equipment, Standard, FailureMode, Location, Personnel, Date"]
            Edges["Edges: document_mentions_entity, entity_related_to_entity, entity_co_occurs"]
        end
    end

    %% ==========================================
    %% 6. RAG & LLM INTELLIGENCE ENGINE
    %% ==========================================
    subgraph RAG["🤖 RAG & LLM INTELLIGENCE ENGINE"]
        direction TB
        ContextFormatter["📋 Context Formatter & Document Citation Builder"]
        GeminiLLM["🌟 Google Gemini API (gemini-1.5-flash)"]
        LocalSynthesizer["🧠 Local Grounded Smart NLP Synthesizer"]
    end

    %% ==========================================
    %% 7. COMPLIANCE & AUDIT ENGINE
    %% ==========================================
    subgraph COMPLIANCE["⚖️ INDUSTRIAL COMPLIANCE & AUDIT ENGINE"]
        direction TB
        RulesJSON["📜 Industrial Rules (rules.json - OSHA, ASME, ISO)"]
        RuleMatcher["🔍 Compliance Regex & NER Entity Checker"]
    end

    %% ==========================================
    %% DATA & CONTROL FLOW CONNECTIONS
    %% ==========================================
    UI -->|HTTP / REST JSON| GATEWAY
    
    Upload -->|POST /upload| APIRouter
    APIRouter --> PARSING
    PyMuPDF --> ParsedJSON
    PDFPlumber --> ParsedJSON
    TesseractOCR --> ParsedJSON

    ParsedJSON --> Chunker
    Chunker --> Embedder
    Embedder -->|Upsert 384d Vectors| ChromaStore

    ParsedJSON --> Migrator
    Migrator --> NeoDriver
    NeoDriver --> CypherRepo
    CypherRepo -->|Cypher MERGE| NEO_CLOUD

    ChatUI -->|POST /chat| APIRouter
    APIRouter --> FilenameFilter
    FilenameFilter -->|Similarity Query| ChromaStore
    ChromaStore -->|Top-5 Chunks| ContextFormatter
    
    ContextFormatter --> GeminiLLM
    GeminiLLM -.->|Fallback if Offline| LocalSynthesizer
    GeminiLLM -->|Grounded Answer + Sources| ChatUI

    KGVis -->|GET /graph| CypherRepo
    CypherRepo -->|Graph Topology JSON| KGVis

    CompUI -->|GET /compliance| RuleMatcher
    RulesJSON --> RuleMatcher
    NEO_CLOUD --> RuleMatcher
    RuleMatcher -->|Compliance Audit Report| CompUI

    DebugUI -->|GET /debug/*| DebugEndpoints
    DebugEndpoints -->|Vector & Pipeline Telemetry| DebugUI
```

---

## 🏛️ Subsystem Architectural Summary

1. **User Interface Tier**:
   React.js 18 + Vite 6 dark-mode SPA featuring interactive graph rendering, dropzone uploading, RAG chat, and pipeline telemetry dashboards.

2. **Multimodal Parsing & Ingestion Engine**:
   PyMuPDF digital text extraction, pdfplumber table parsing, and Tesseract OCR for scanned diagrams. Normalizes document raw text into `storage/parsed_docs/DOC-*.json`.

3. **Vector DB & Embeddings Subsystem**:
   Chunks parsed text into 500-word sliding windows, generates 384-dimensional dense vectors using SentenceTransformers (`all-MiniLM-L6-v2`), and stores 1,790+ vectors in ChromaDB (`storage/chroma_db`). Employs Filename-Aware filtering for targeted document retrieval.

4. **Neo4j Cloud Knowledge Graph Engine**:
   Connected to **Neo4j Aura Cloud Instance** (`neo4j+s://e4d95fb2.databases.neo4j.io`). Houses 7 node categories and 3 relationship edge types, supporting fast Cypher 1-hop traversals and graph topology exports.

5. **RAG & LLM Intelligence Engine**:
   Formats retrieved context passages, constructs guardrailed prompts, and queries Google Gemini API (`gemini-1.5-flash`), with fallback to a local grounded Smart NLP Synthesizer.

6. **Compliance & Debug Telemetry Suite**:
   Audits plant entities against OSHA 1910, ASME Boiler Code, and ISO 55001 rules defined in `rules.json`, exposed via 5 REST debug endpoints (`/debug/*`).
