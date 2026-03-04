from __future__ import annotations

import os
from contextlib import contextmanager

from sqlmodel import Session, SQLModel, create_engine


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./demo.db")

# Security: Warn if using SQLite in production
_is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"
if _is_production and DATABASE_URL.startswith("sqlite"):
    import warnings
    warnings.warn(
        "CRITICAL: SQLite detected in production! "
        "Set DATABASE_URL to a PostgreSQL connection string. "
        "SQLite does not support concurrent writes and risks data loss.",
        RuntimeWarning
    )

# Configure connection pool for PostgreSQL
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
_pool_settings = {} if DATABASE_URL.startswith("sqlite") else {"pool_size": 20, "max_overflow": 40}

engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    connect_args=_connect_args,
    **_pool_settings
)


def init_db() -> None:
    """Create database tables if they do not already exist."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Session:
    with Session(engine) as session:
        yield session


@contextmanager
def session_scope() -> Session:
    """Provide a transactional scope for scripts such as seeders."""
    with Session(engine) as session:
        yield session


