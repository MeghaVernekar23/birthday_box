from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from db.sessions import DATABASE_URL, Base
import db.models.sqlalchemy_models  # noqa: F401  (registers models on Base.metadata)

config = context.config

# Only configure logging when run from the CLI. When the app runs migrations
# on startup, fileConfig would otherwise disable uvicorn's loggers.
if config.config_file_name is not None and config.attributes.get("configure_logger", True):
    fileConfig(config.config_file_name, disable_existing_loggers=False)

# Override with `alembic -x url=sqlite:///./other.db ...` when needed.
url_override = context.get_x_argument(as_dictionary=True).get("url")
if url_override or not config.get_main_option("sqlalchemy.url"):
    config.set_main_option("sqlalchemy.url", url_override or DATABASE_URL)

target_metadata = Base.metadata


# --- SQLite noise filters ---------------------------------------------------
# The production DB was created by hand before Alembic, so autogenerate sees
# differences that mean nothing in SQLite. These hooks hide only those, so a
# new revision contains just the change you actually made to the models.

def _sqlite_affinity(type_str: str) -> str:
    """SQLite's column affinity rules (https://sqlite.org/datatype3.html#affname)."""
    t = type_str.upper()
    if "INT" in t or "BOOL" in t:  # BOOLEAN is stored as 0/1 integers
        return "INTEGER"
    if any(k in t for k in ("CHAR", "CLOB", "TEXT")):
        return "TEXT"
    if not t or "BLOB" in t:
        return "BLOB"
    if any(k in t for k in ("REAL", "FLOA", "DOUB")):
        return "REAL"
    return "NUMERIC"


def compare_type(ctx, inspected_column, metadata_column, inspected_type, metadata_type):
    if ctx.dialect.name != "sqlite":
        return None  # default comparison
    db_aff = _sqlite_affinity(str(inspected_type))
    model_aff = _sqlite_affinity(str(metadata_type.compile(dialect=ctx.dialect)))
    if model_aff == "NUMERIC" and db_aff in ("INTEGER", "REAL") or db_aff == "NUMERIC" and model_aff in ("INTEGER", "REAL"):
        return False
    return db_aff != model_aff


def include_object(obj, name, type_, reflected, compare_to):
    if context.get_context().dialect.name != "sqlite":
        return True
    # SQLite doesn't enforce foreign keys (PRAGMA foreign_keys is off).
    if type_ == "foreign_key_constraint":
        return False
    # An index on an INTEGER PRIMARY KEY duplicates the rowid; ignore it.
    if type_ == "index":
        cols = list(obj.columns)
        if len(cols) == 1 and cols[0].primary_key:
            return False
    return True


def process_revision_directives(ctx, revision, directives):
    """Drop nullable-only changes on primary keys (INTEGER PRIMARY KEY is never NULL)."""
    if ctx.dialect.name != "sqlite" or not directives:
        return
    from alembic.operations import ops

    def keep(op):
        if isinstance(op, ops.AlterColumnOp):
            col = target_metadata.tables.get(op.table_name)
            col = col.c.get(op.column_name) if col is not None else None
            only_nullable = op.modify_nullable is not None and op.modify_type is None \
                and op.modify_server_default is False and op.modify_name is None
            if col is not None and col.primary_key and only_nullable:
                return False
        return True

    def prune(container):
        container.ops = [
            o for o in (prune(o) if hasattr(o, "ops") else o for o in container.ops)
            if keep(o) and not (hasattr(o, "ops") and not o.ops)
        ]
        return container

    for d in directives:
        for up in d.upgrade_ops_list:
            prune(up)
        for down in d.downgrade_ops_list:
            prune(down)


SHARED_OPTS = dict(
    target_metadata=target_metadata,
    # SQLite can't ALTER/DROP columns; batch mode recreates the table instead.
    render_as_batch=True,
    compare_type=compare_type,
    include_object=include_object,
    process_revision_directives=process_revision_directives,
)


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        **SHARED_OPTS,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = config.attributes.get("connection")
    if connectable is None:
        connectable = engine_from_config(
            config.get_section(config.config_ini_section, {}),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )
        with connectable.connect() as connection:
            _run(connection)
    else:
        _run(connectable)


def _run(connection) -> None:
    context.configure(
        connection=connection,
        **SHARED_OPTS,
    )
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
