"""
PlantBrain Secure Configuration System
Uses Pydantic Settings to load and validate environment variables.
"""
import os
from pathlib import Path
from typing import Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Production-ready settings management class."""

    # API Keys
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")
    GROQ_API_KEY: str = Field(default="", description="Groq API Key (Optional)")

    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./plantbrain.db",
        description="SQLAlchemy Database URL"
    )

    # Neo4j Graph Database Configuration
    NEO4J_URI: str = Field(default="neo4j+s://e4d95fb2.databases.neo4j.io", description="Neo4j Connection URI")
    NEO4J_USERNAME: str = Field(default="e4d95fb2", description="Neo4j Username")
    NEO4J_PASSWORD: str = Field(default="PRhbU0wBbgmuqwAKTlZjZoxIhxx_wUHP0lV3QlHXGag", description="Neo4j Password")
    NEO4J_DATABASE: str = Field(default="e4d95fb2", description="Neo4j Database Name")


    # Storage Paths
    UPLOAD_DIR: str = Field(default="storage/uploads", description="Target folder for uploaded files")
    PARSED_DIR: str = Field(default="storage/parsed_docs", description="Target folder for parsed JSON docs")
    VECTOR_DB_DIR: str = Field(default="storage/chroma_db", description="Target folder for ChromaDB vector store")

    # OCR & AI Parameters
    TESSERACT_CMD: str = Field(default="", description="Path to Tesseract executable (Optional)")
    EMBEDDING_MODEL: str = Field(default="all-MiniLM-L6-v2", description="Sentence Transformers embedding model")
    DEFAULT_PROVIDER: str = Field(default="gemini", description="Default AI Provider (gemini/groq)")

    # Application Settings
    DEBUG: bool = Field(default=True, description="Enable debug logging")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("DATABASE_URL must be specified.")
        return v

    @property
    def upload_path(self) -> Path:
        return Path(self.UPLOAD_DIR)

    @property
    def parsed_path(self) -> Path:
        return Path(self.PARSED_DIR)

    @property
    def vector_db_path(self) -> Path:
        return Path(self.VECTOR_DB_DIR)

    def ensure_directories(self) -> None:
        """Create all required storage directories if missing."""
        self.upload_path.mkdir(parents=True, exist_ok=True)
        self.parsed_path.mkdir(parents=True, exist_ok=True)
        self.vector_db_path.mkdir(parents=True, exist_ok=True)

    def is_gemini_configured(self) -> bool:
        """Check if a valid Gemini API key is configured."""
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY != "your_gemini_api_key_here")

    def is_neo4j_configured(self) -> bool:
        """Check if Neo4j connection parameters are configured."""
        return bool(self.NEO4J_URI and self.NEO4J_USERNAME and self.NEO4J_PASSWORD)



# Singleton settings instance
settings = Settings()
