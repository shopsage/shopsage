"""SQLite database engine and session management for ShopSage."""

import os
from sqlmodel import SQLModel, Session, create_engine

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "shopsage.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Create all SQLModel tables. Called from FastAPI lifespan on startup."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency that yields a SQLModel session."""
    with Session(engine) as session:
        yield session
