"""Run Alembic migrations programmatically (used on app startup)."""
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from db.sessions import engine

BACKEND_DIR = Path(__file__).resolve().parent.parent

# Revision that describes the schema as it existed before Alembic was added.
# Databases created before then are stamped with it instead of re-created.
BASELINE_REVISION = "8ef65f010fbf"


def _alembic_config() -> Config:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    cfg.attributes["configure_logger"] = False  # keep uvicorn's logging intact
    return cfg


def run_migrations() -> None:
    """Bring the database schema up to the latest revision."""
    cfg = _alembic_config()
    with engine.begin() as connection:
        cfg.attributes["connection"] = connection
        tables = set(inspect(connection).get_table_names())
        if "alembic_version" not in tables and "users" in tables:
            # Pre-Alembic database: its tables already match the baseline.
            command.stamp(cfg, BASELINE_REVISION)
        command.upgrade(cfg, "head")
