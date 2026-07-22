"""
PlantBrain Reusable Entity Extraction Module
Uses spaCy NLP plus Regex pattern matchers to extract industrial entities:
- Equipment IDs
- Personnel
- Dates
- Standards
- Failure Modes
- Locations

Outputs to storage/parsed_docs/entities.json.
"""
import re
import json
from pathlib import Path
from typing import List, Dict, Any

from app.config import settings

ENTITIES_FILE = settings.parsed_path / "entities.json"
ENTITIES_FILE.parent.mkdir(parents=True, exist_ok=True)


# Regex Patterns for Industrial Domain Entities
PATTERNS = {
    "Equipment ID": [
        r"\b(?:PUMP|VALV|TURB|COMP|PIPE|SENS|GEN|BOIL|TANK|ELEC|MOTOR)-[A-Z0-9]+(?:-[0-9]+)?\b",
        r"\b[A-Z]{2,4}-[A-Z0-9]+-\d{3,4}\b",
        r"\bTAG-\d{4}\b",
        r"\bEQP-[A-Z0-9-]+\b"
    ],
    "Standards": [
        r"\bOSHA(?: 1910)?(?:\.\d+)?\b",
        r"\bASME(?: [A-Z0-9\.]+)?\b",
        r"\bISO \d{4,5}(?::\d{4})?\b",
        r"\bEPA-[A-Z0-9-]+\b",
        r"\bNFPA \d+\b"
    ],
    "Failure Modes": [
        r"\b(?:vibration|cavitation|overpressure|leak|leakage|bearing failure|overheating|corrosion|fatigue|thermal stress|short circuit|pressure spike|trip|valve seizure)\b"
    ],
    "Locations": [
        r"\b(?:Unit Alpha|Plant Facility #04|Control Room|Turbine Hall|Substation B|Boiler Room|Compressor House|P&ID Bay 4)\b"
    ],
    "Dates": [
        r"\b\d{4}-\d{2}-\d{2}\b",
        r"\b\d{2}/\d{2}/\d{4}\b",
        r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b"
    ]
}

# Try loading spaCy model if installed
nlp = None
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = spacy.blank("en")
except Exception:
    nlp = None


def extract_entities(raw_text: str, filename: str, page_count: int = 1) -> List[Dict[str, Any]]:
    """
    Extract industrial entities from document raw text using spaCy and Regex matchers.
    Returns list of dicts: [{ entity, type, document, page, confidence }].
    """
    extracted: List[Dict[str, Any]] = []
    seen_keys = set()

    if not raw_text:
        return extracted

    # 1. Regex Pattern Matching
    for entity_type, regex_list in PATTERNS.items():
        for pattern in regex_list:
            matches = re.finditer(pattern, raw_text, re.IGNORECASE)
            for m in matches:
                entity_val = m.group(0).strip()
                # Clean up capitalization for equipment IDs & standards
                if entity_type in ["Equipment ID", "Standards"]:
                    entity_val = entity_val.upper()

                unique_key = (entity_val, entity_type, filename)
                if unique_key not in seen_keys:
                    seen_keys.add(unique_key)
                    extracted.append({
                        "entity": entity_val,
                        "type": entity_type,
                        "document": filename,
                        "page": 1,
                        "confidence": 0.98 if entity_type == "Equipment ID" else 0.95
                    })

    # 2. spaCy NER Processing for Personnel & Dates & Locations
    if nlp is not None:
        try:
            doc = nlp(raw_text[:50000])  # Cap at 50k chars for fast processing
            for ent in doc.ents:
                ent_text = ent.text.strip()
                if len(ent_text) < 2:
                    continue

                mapped_type = None
                if ent.label_ == "PERSON":
                    mapped_type = "Personnel"
                elif ent.label_ == "DATE":
                    mapped_type = "Dates"
                elif ent.label_ in ["GPE", "LOC", "FAC"]:
                    mapped_type = "Locations"

                if mapped_type:
                    unique_key = (ent_text, mapped_type, filename)
                    if unique_key not in seen_keys:
                        seen_keys.add(unique_key)
                        extracted.append({
                            "entity": ent_text,
                            "type": mapped_type,
                            "document": filename,
                            "page": 1,
                            "confidence": 0.90
                        })
        except Exception:
            pass

    # Save / Update entities.json
    save_entities(extracted)

    return extracted


def save_entities(new_entities: List[Dict[str, Any]]):
    """Persist new extracted entities into storage/parsed_docs/entities.json."""
    existing_entities = load_all_entities()
    
    seen = {(e["entity"], e["type"], e["document"]) for e in existing_entities}
    for item in new_entities:
        key = (item["entity"], item["type"], item["document"])
        if key not in seen:
            seen.add(key)
            existing_entities.append(item)

    with open(ENTITIES_FILE, "w", encoding="utf-8") as f:
        json.dump(existing_entities, f, indent=2)


def load_all_entities() -> List[Dict[str, Any]]:
    """Load all extracted entities from storage/parsed_docs/entities.json."""
    if ENTITIES_FILE.exists():
        try:
            with open(ENTITIES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []
