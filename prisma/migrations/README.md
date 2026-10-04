# Migration history

Prisma applies folders in this directory in **lexicographic order**. We use a sequential prefix so anyone can read the history top to bottom.

## Naming convention

```text
NNNN_short_snake_name/
  migration.sql
```

| Piece | Rule | Example |
| --- | --- | --- |
| `NNNN` | Zero-padded 4-digit sequence | `0001`, `0002`, `0003` |
| `short_snake_name` | What changed, lowercase | `init`, `add_norm_chunks` |

Examples:

- `0001_init`
- `0002_add_norm_chunks`
- `0003_add_review_result_json`

Do **not** use random timestamps as the primary readable id. If Prisma generates a timestamp folder via `migrate:dev --create-only`, rename it to the next `NNNN_...` **before** committing and before teammates apply it.

## How to add the next migration

1. Edit `prisma/schema.prisma`.
2. Create SQL (either):
   - `npm run db:migrate:dev -- --create-only --name short_snake_name`, then rename the new folder to `NNNN_short_snake_name`, or
   - Hand-create `prisma/migrations/NNNN_short_snake_name/migration.sql`.
3. Add a row to the changelog table below (why this migration exists).
4. Apply locally:

```bash
npm run db:migrate
```

5. Never edit a migration that was already applied on shared/prod DBs. Add `000N+1_...` instead.

## Changelog (why each migration exists)

| # | Folder | Why we added it |
| --- | --- | --- |
| 1 | `0001_init` | Baseline schema for the MVP: enable `pgvector`, create `users`, `permits`, `norm_docs`, `review_runs`, and `review_run_norms`. Needed so durable storage can replace the in-memory mock later, and so RAG can use the same Postgres later. |
| 2 | `0002_add_documents` | Split file bytes off `permits` into `documents` (`DocumentKind` pdf/image). A permit is a case that owns many documents. Migrates existing permit file columns into one document per permit. |

## Related docs

- Prisma workflow: [`docs/prisma.md`](../../docs/prisma.md)
- Schema / ERD: [`docs/database.md`](../../docs/database.md)
- Schema source of truth: [`../schema.prisma`](../schema.prisma)
