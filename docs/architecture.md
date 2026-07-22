# PlantBrain Architecture Specification 🏗️

## System Overview

PlantBrain is structured around a modular pipeline architecture designed to ingest complex industrial technical documents (P&ID diagrams, operating manuals, maintenance logs, safety protocols), extract entities and relationships into a Knowledge Graph, generate vector embeddings for semantic search, execute RAG-driven AI assistance, and verify regulatory compliance.

```
                    ┌─────────────────────────┐
                    │   React 19 Dashboard    │
                    │  (Vite + Tailwind CSS)  │
                    └────────────┬────────────┘
                                 │ HTTP / JSON
                                 ▼
                    ┌─────────────────────────┐
                    │    FastAPI API Layer    │
                    │      (app/api/)         │
                    └────────────┬────────────┘
                                 │
  ┌──────────────────────────────┼──────────────────────────────┐
  │                              │                              │
  ▼                              ▼                              ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│ Ingestion Pipeline│  │ Extraction Module │  │ Knowledge Graph   │
│ (PyMuPDF/OCR)     │  │ (spaCy/NER)       │  │ (NetworkX)        │
└─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Embeddings & RAG Engine │
                    │ (ChromaDB + Gemini API) │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Compliance Evaluator   │
                    │  & SQLite Database      │
                    └─────────────────────────┘
```

## Subsystem Details

### 1. Ingestion (`app/ingestion`)
- Parses PDF documents using PyMuPDF (`fitz`).
- Performs OCR on scanned images or diagrams using Tesseract OCR (`pytesseract`).
- Extracts text layout, tables, and embedded images.

### 2. Extraction (`app/extraction`)
- Performs Named Entity Recognition (NER) for industrial components (Pumps, Valves, Heat Exchangers, Pipelines).
- Identifies relation triples: `(Pump_A1, SUPPLIES_TO, Valve_B2)`.

### 3. Knowledge Graph (`app/graph`)
- Constructs graph structures via `NetworkX`.
- Powers topological dependency checks, failure cascade simulations, and component relationship queries.

### 4. Embeddings & RAG (`app/embeddings`, `app/rag`)
- Generates semantic embeddings with `Sentence Transformers`.
- Stores vectors in `ChromaDB`.
- Synthesizes contextual answers via Google Gemini API (`google-genai`).

### 5. Compliance (`app/compliance`)
- Evaluates extracted rules against industrial safety standards (ISO, OSHA, ASME).
- Highlights missing checks, expired certifications, and non-compliance risks.

### 6. Database (`app/database`)
- Manages metadata persistence using SQLAlchemy 2.0 and SQLite.
