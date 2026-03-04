"""Database engine and session management for ShopSage.

Supports SQLite (local dev) and PostgreSQL (production via DATABASE_URL env var).
"""

import os
from sqlmodel import SQLModel, Session, create_engine

_DATABASE_URL = os.getenv("DATABASE_URL")

if _DATABASE_URL:
    # Railway (and some other hosts) provide postgres:// — SQLAlchemy needs postgresql://
    if _DATABASE_URL.startswith("postgres://"):
        _DATABASE_URL = _DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(_DATABASE_URL)
else:
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "shopsage.db")
    engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Create all SQLModel tables. Called from FastAPI lifespan on startup."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency that yields a SQLModel session."""
    with Session(engine) as session:
        yield session
