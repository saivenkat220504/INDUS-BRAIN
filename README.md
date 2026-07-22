# PlantBrain 🌿🧠

**PlantBrain** is an enterprise-grade, full-stack AI knowledge engine designed for industrial plant documentation, intelligence extraction, operational compliance, and automated reasoning.

---

## 🎨 Tech Stack

### Frontend
- **Framework & Tooling**: React 19, Vite, React Router v7
- **Styling & Icons**: Tailwind CSS v4, Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: Python FastAPI, Uvicorn (ASGI Server)
- **Data & Schemas**: Pydantic v2, SQLAlchemy 2.0, SQLite
- **Architecture**: Modular domain packages (Ingestion, Extraction, Graph, Embeddings, RAG, Compliance)

### Future AI/ML Integrations (Prepared Architecture)
- **Document OCR & Parsing**: PyMuPDF (`fitz`), Tesseract OCR (`pytesseract`), spaCy
- **Knowledge Graph**: NetworkX
- **Vector Search & RAG**: ChromaDB, Sentence Transformers
- **Generative Intelligence**: Google Gemini API (`google-genai`)

---

## 📂 Project Architecture

```
PlantBrain/
├── frontend/             # React 19 + Vite + Tailwind CSS Industrial UI
│   ├── src/
│   │   ├── assets/       # Static assets & media
│   │   ├── components/   # Modular UI elements (Sidebar, Navbar, etc.)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Application wrapper & navigation layouts
│   │   ├── pages/        # Dashboard, Upload, Chat, Graph, Compliance, Settings
│   │   ├── services/     # Axios API layer configured for localhost FastAPI
│   │   └── utils/        # Utility & helper functions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/              # Python FastAPI REST Server
│   ├── app/
│   │   ├── api/          # API Route handlers & Controllers
│   │   ├── compliance/   # Operational compliance audit modules
│   │   ├── database/     # SQLAlchemy engine, session & models
│   │   ├── embeddings/   # Vector embedding generators
│   │   ├── extraction/   # Entity & relation extraction pipelines
│   │   ├── graph/        # NetworkX knowledge graph representation
│   │   ├── ingestion/    # PDF/Image/Doc parsing pipeline
│   │   ├── rag/          # Retrieval Augmented Generation system
│   │   ├── utils/        # Shared helper functions & loggers
│   │   └── main.py       # FastAPI application entrypoint with CORS
│   └── requirements.txt
├── docs/                 # Architectural documentation & specifications
│   └── architecture.md
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

FastAPI server runs at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install node packages
npm install

# Start Vite dev server
npm run dev
```

Frontend UI runs at: `http://localhost:5173`

---

## 📌 Available Pages

1. **Dashboard**: High-level industrial operational metrics, processing pipelines, and node stats.
2. **Upload Documents**: File dropzone for manuals, technical sheets, and compliance PDFs.
3. **AI Chat**: Industrial query assistant powered by RAG context.
4. **Knowledge Graph**: Interactive visualization of plant components, relationships, and equipment dependencies.
5. **Compliance Dashboard**: Regulatory risk auditing, standards checking, and policy alerts.
6. **Settings**: Configuration for LLM providers, database connection strings, and system preferences.

---

## 🛠️ API Endpoints

- `GET /`: Health status and basic service metadata.
- `GET /health`: Detailed status check for DB connection, runtime health, and uptime.
- `GET /api/v1/metrics`: Summary metrics for the industrial dashboard.

---

## 📜 License

MIT License. Designed for scalable industrial AI applications.
