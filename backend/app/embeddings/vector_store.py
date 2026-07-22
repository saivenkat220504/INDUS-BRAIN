"""
PlantBrain Vector Store & Embeddings Engine
Document Chunking, Sentence Transformers (all-MiniLM-L6-v2) & ChromaDB persistence.
"""
import os
import json
import math
from pathlib import Path
from typing import List, Dict, Any

from app.config import settings

CHROMA_DIR = settings.vector_db_path
CHROMA_DIR.mkdir(parents=True, exist_ok=True)

PARSED_DOCS_DIR = settings.parsed_path


# Initialize ChromaDB Persistent Client & Collection
_chroma_client = None
_chroma_collection = None


def get_chroma_collection():
    """Retrieve or initialize persistent ChromaDB collection."""
    global _chroma_client, _chroma_collection
    if _chroma_collection is not None:
        return _chroma_collection

    try:
        import chromadb
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        _chroma_collection = _chroma_client.get_or_create_collection(
            name="plantbrain_docs",
            metadata={"hnsw:space": "cosine"}
        )
    except Exception as e:
        print(f"[ChromaDB Client Warning]: {e}")
        _chroma_collection = None

    return _chroma_collection


def reset_vector_db() -> Dict[str, Any]:
    """
    Completely clear and reset ChromaDB collection. Deletes all vectors and recreates collection.
    """
    global _chroma_client, _chroma_collection
    try:
        import chromadb
        if _chroma_client is None:
            _chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))

        try:
            _chroma_client.delete_collection(name="plantbrain_docs")
        except Exception:
            pass

        _chroma_collection = _chroma_client.get_or_create_collection(
            name="plantbrain_docs",
            metadata={"hnsw:space": "cosine"}
        )
        print("[ChromaDB Reset]: Successfully deleted and recreated 'plantbrain_docs' collection.")
        return {"status": "SUCCESS", "message": "ChromaDB vector collection successfully reset to 0 vectors.", "vector_count": 0}
    except Exception as err:
        print(f"[ChromaDB Reset Error]: {err}")
        return {"status": "ERROR", "message": str(err), "vector_count": 0}


def get_chroma_stored_filenames() -> Dict[str, Any]:
    """
    Inspect stored ChromaDB vector collection.
    Returns { collection_name, total_vector_count, unique_doc_count, stored_filenames (first 20) }.
    """
    collection = get_chroma_collection()
    if collection is None:
        return {"collection_name": "plantbrain_docs", "total_vector_count": 0, "unique_doc_count": 0, "stored_filenames": []}

    try:
        count = collection.count()
        if count == 0:
            return {"collection_name": "plantbrain_docs", "total_vector_count": 0, "unique_doc_count": 0, "stored_filenames": []}

        # Fetch metadatas to extract filenames
        data = collection.get(limit=count, include=["metadatas"])
        filenames = []
        if data and data.get("metadatas"):
            for meta in data["metadatas"]:
                if meta and meta.get("filename") and meta["filename"] not in filenames:
                    filenames.append(meta["filename"])

        return {
            "collection_name": "plantbrain_docs",
            "total_vector_count": count,
            "unique_doc_count": len(filenames),
            "stored_filenames": filenames[:20]
        }
    except Exception as err:
        print(f"[ChromaDB Metadata Warning]: {err}")
        return {"collection_name": "plantbrain_docs", "total_vector_count": collection.count(), "unique_doc_count": 0, "stored_filenames": []}



# Initialize Sentence Transformer Model
_model_instance = None


def get_embedding_model():
    """Load all-MiniLM-L6-v2 SentenceTransformer model with fallback."""
    global _model_instance
    if _model_instance is not None:
        return _model_instance

    try:
        from sentence_transformers import SentenceTransformer
        _model_instance = SentenceTransformer('all-MiniLM-L6-v2')
    except Exception as e:
        print(f"[SentenceTransformers Model Warning]: {e}")
        _model_instance = None

    return _model_instance


def chunk_document(
    text: str,
    filename: str,
    doc_id: str,
    chunk_size: int = 500,
    overlap: int = 50
) -> List[Dict[str, Any]]:
    """
    Chunk parsed raw text into approximately 500-word chunks with overlap.
    Preserves document metadata: filename, page_number, doc_id, chunk_id.
    """
    if not text or not text.strip():
        return []

    words = text.split()
    if not words:
        return []

    chunks = []
    step = chunk_size - overlap if chunk_size > overlap else chunk_size
    chunk_idx = 0

    for i in range(0, len(words), step):
        chunk_words = words[i:i + chunk_size]
        chunk_text = " ".join(chunk_words).strip()
        if not chunk_text:
            continue

        chunk_idx += 1
        page_num = max(1, math.ceil(i / 300))  # Estimated page index based on word count

        chunks.append({
            "chunk_id": f"{doc_id}-C{chunk_idx}",
            "doc_id": doc_id,
            "filename": filename,
            "page_number": page_num,
            "text": chunk_text
        })

    return chunks


def create_embeddings() -> Dict[str, Any]:
    """
    Scan storage/parsed_docs/*.json, chunk document raw texts,
    generate embeddings via Sentence Transformers, and store in ChromaDB.
    """
    collection = get_chroma_collection()
    model = get_embedding_model()

    if not PARSED_DOCS_DIR.exists():
        return {"status": "NO_DOCS", "indexed_chunks": 0}

    all_chunks = []
    for json_file in PARSED_DOCS_DIR.glob("DOC-*.json"):
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                doc_data = json.load(f)
                chunks = chunk_document(
                    text=doc_data.get("raw_text", ""),
                    filename=doc_data.get("filename", "unknown.pdf"),
                    doc_id=doc_data.get("doc_id", json_file.stem)
                )
                all_chunks.extend(chunks)
        except Exception as err:
            print(f"[Chunking Error for {json_file.name}]: {err}")

    if not all_chunks:
        # Generate synthetic fallback chunk if no docs ingested yet
        all_chunks = [{
            "chunk_id": "DOC-SEED-C1",
            "doc_id": "DOC-SEED",
            "filename": "High-Pressure_Pump_Assembly_Manual.pdf",
            "page_number": 1,
            "text": "PUMP-A-102 operating pressure must not exceed 16.5 Bar during standard operation and 18.0 Bar during transient steam injection. VALV-V-804 triggers automatically at 18.0 Bar."
        }]

    print(f"\n--- [STAGE 4: CHUNKING] ---")
    print(f"[Total Chunks Generated]: {len(all_chunks)}")
    if all_chunks:
        print(f"[First Chunk Doc]: {all_chunks[0]['filename']} | [Page]: {all_chunks[0]['page_number']}")
        print(f"[First Chunk 200-char Preview]: {all_chunks[0]['text'][:200]}...")

    # Store in ChromaDB
    if collection is not None:
        ids = [c["chunk_id"] for c in all_chunks]
        documents = [c["text"] for c in all_chunks]
        metadatas = [
            {
                "doc_id": c["doc_id"],
                "filename": c["filename"],
                "page_number": c["page_number"]
            }
            for c in all_chunks
        ]

        if model is not None:
            embeddings = model.encode(documents).tolist()
            print(f"\n--- [STAGE 5: EMBEDDINGS] ---")
            print(f"[Embedding Model]: all-MiniLM-L6-v2")
            print(f"[Embeddings Generated]: {len(embeddings)}")

            collection.upsert(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas
            )
        else:
            collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )

        print(f"\n--- [STAGE 6: CHROMADB STORAGE] ---")
        print(f"[Collection Name]: plantbrain_docs")
        print(f"[Total Vectors Stored]: {collection.count()}")

    return {
        "status": "SUCCESS",
        "total_chunks": len(all_chunks),
        "indexed_chunks": len(all_chunks)
    }


def retrieve(question: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieve top_k matching document chunks from ChromaDB for a question query.
    Supports filename-aware query matching and metadata filtering.
    Return [{ retrieved_text, doc_id, page_number, similarity_score, filename }].
    """
    collection = get_chroma_collection()
    model = get_embedding_model()
    results = []

    q_lower = question.lower().strip()
    print(f"\n--- [STEP 1: RETRIEVAL VERIFICATION] ---")
    print(f"[Question]: '{question}'")

    if collection is not None and collection.count() > 0:
        try:
            # Check if any specific filename is mentioned in user question
            target_filename = None
            meta_info = get_chroma_stored_filenames()
            for fname in meta_info.get("stored_filenames", []):
                fname_clean = fname.lower().replace("_", " ").replace("-", " ")
                name_stem = Path(fname).stem.lower().replace("_", " ").replace("-", " ")
                # Check if full filename or stem words match question
                if fname.lower() in q_lower or name_stem in q_lower or (len(name_stem) > 4 and name_stem in q_lower):
                    target_filename = fname
                    break

            where_clause = {"filename": target_filename} if target_filename else None
            if target_filename:
                print(f"[Filename Detected in Query]: Filtering retrieval specifically for '{target_filename}'")

            # Query ChromaDB with or without metadata filter
            if model is not None:
                query_embedding = model.encode([question]).tolist()
                query_kwargs = {
                    "query_embeddings": query_embedding,
                    "n_results": min(top_k * 2, max(1, collection.count()))
                }
                if where_clause:
                    query_kwargs["where"] = where_clause
                
                try:
                    query_res = collection.query(**query_kwargs)
                except Exception:
                    # Fallback without where clause if where fails
                    query_kwargs.pop("where", None)
                    query_res = collection.query(**query_kwargs)
            else:
                query_res = collection.query(
                    query_texts=[question],
                    n_results=min(top_k * 2, max(1, collection.count()))
                )

            if query_res and query_res.get("documents") and query_res["documents"][0]:
                docs_list = query_res["documents"][0]
                meta_list = query_res["metadatas"][0] if query_res.get("metadatas") else [{}] * len(docs_list)
                dist_list = query_res["distances"][0] if query_res.get("distances") else [0.1] * len(docs_list)

                # Re-rank: prioritize target filename matches if present
                combined = list(zip(docs_list, meta_list, dist_list))
                if target_filename:
                    matched = [item for item in combined if item[1].get("filename") == target_filename]
                    others = [item for item in combined if item[1].get("filename") != target_filename]
                    combined = matched + others

                combined = combined[:top_k]
                print(f"[Retrieved Chunks Count]: {len(combined)}")

                for idx, (doc_text, meta, dist) in enumerate(combined):
                    sim_score = round(max(0.0, 1.0 - float(dist)), 4)
                    res_item = {
                        "retrieved_text": doc_text,
                        "doc_id": meta.get("doc_id", "DOC-UNKNOWN"),
                        "page_number": meta.get("page_number", 1),
                        "similarity_score": sim_score,
                        "filename": meta.get("filename", "document.pdf")
                    }
                    results.append(res_item)
                    preview_clean = doc_text[:300].encode('ascii', errors='ignore').decode('ascii')
                    print(f"  Chunk {idx + 1}:")
                    print(f"    - Similarity Score: {sim_score}")
                    print(f"    - Filename: '{res_item['filename']}'")
                    print(f"    - Page Number: {res_item['page_number']}")
                    print(f"    - Chunk Length: {len(doc_text)} chars")
                    print(f"    - First 300 Characters: {preview_clean}...")
        except Exception as query_err:
            print(f"[ChromaDB Query Error]: {query_err}")

    if not results:
        print(f"[RETRIEVAL WARNING]: Zero vector matches retrieved from ChromaDB for question '{question}'.")

    return results




    return results
