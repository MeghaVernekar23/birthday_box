# Birthday Box backend

## Database migrations (Alembic)

The schema is managed by [Alembic](https://alembic.sqlalchemy.org/). On startup the
app runs `alembic upgrade head` automatically (see `db/migrations.py`), so deploying
a migration is just `git pull` + restart.

### Changing a model

1. Edit `db/models/sqlalchemy_models.py`.
2. From `backend/`, generate a migration:
   ```bash
   uv run alembic revision --autogenerate -m "add instagram to customers"
   ```
3. **Read the generated file** in `alembic/versions/`. Autogenerate can't detect
   renames (it sees drop + add, which loses data). Edit those into
   `batch_op.alter_column(..., new_column_name=...)`.
4. Apply locally: `uv run alembic upgrade head` (or just restart the app).
5. Commit the model change and the migration file together.

Adding a `nullable=False` column to a table that has rows needs a default,
e.g. `sa.Column("x", sa.String(), nullable=False, server_default="")`.

### Useful commands

```bash
uv run alembic current          # revision the DB is at
uv run alembic history          # all revisions
uv run alembic downgrade -1     # undo the last migration
uv run alembic check            # fails if models and DB have drifted
uv run alembic -x url=sqlite:///./other.db upgrade head   # target another DB
```

### Notes

- SQLite can't `ALTER` most things, so migrations use batch mode (copy table →
  recreate → copy back). `alembic/env.py` turns this on and hides differences
  that mean nothing in SQLite (TEXT vs VARCHAR, PK nullability, FKs, PK indexes).
- Databases created before Alembic are stamped with the baseline revision
  (`8ef65f010fbf`) on first startup rather than re-created.
- `celebration_type.active` has no declared type in the existing production DB.
  A batch migration on that table must pass
  `reflect_args=[sa.Column("active", sa.Integer())]` to `batch_alter_table`.
- Back up `birthdayBox.db` before deploying a migration to production.
