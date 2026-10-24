# Database

This project uses **Prisma** for the schema, migrations, and (later) queries.

- Prisma guide: [prisma.md](./prisma.md)
- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/` (sequential `0001_...`, `0002_...`)
- Migration changelog: `prisma/migrations/README.md`
- Client: `src/lib/db/client.ts`

Local runtime: Colima + Compose (`docker/docker-compose.yml`) using `pgvector/pgvector:pg16`.

## Apply tables

```bash
colima start
npm run docker:up
cp .env.example .env.local    # once
npm run db:migrate
```

| Script                      | What it does                                       |
| --------------------------- | -------------------------------------------------- |
| `npm run docker:up`         | Start Postgres + LocalStack                        |
| `npm run docker:down`       | Stop Compose services                              |
| `npm run db:migrate`        | Apply pending Prisma migrations (`migrate deploy`) |
| `npm run db:migrate:dev`    | Create/apply migrations while editing the schema   |
| `npm run db:migrate:status` | Show migration status                              |
| `npm run db:reset`          | Wipe Docker volumes and re-apply migrations        |
| `npm run db:studio`         | Open Prisma Studio                                 |
| `npm run db:generate`       | Regenerate Prisma Client                           |

## Up / down note

Prisma is **forward-migration** oriented:

- **Up / apply:** `npm run db:migrate`
- **Change schema:** edit `prisma/schema.prisma`, create the next numbered migration, document why in `prisma/migrations/README.md`
- **Local full rollback:** `npm run db:reset`

Details: [prisma.md](./prisma.md).

## Entities

- **users**: keyed by email for the mock-auth era. Later map Clerk user IDs here.
- **permits**: permit *case* (`title`, `type` via `PermitType` enum). Does **not** store file bytes.
- **documents**: uploaded PDF or image files (`DocumentKind`: `pdf` | `image`) belonging to a permit. Holds `storage_key` for S3/LocalStack.
- **norm_docs**: city-norm context (paste, upload, or future web-fetched content).
- **review_runs**: selected permit + norms for an LLM review attempt.
- **review_run_norms**: join table for many norms per review.
- **norm_chunks** (later): chunked text + optional `vector` embedding for RAG.

## Migrations today

| #   | Folder               | Purpose                                                                 |
| --- | -------------------- | ----------------------------------------------------------------------- |
| 1   | `0001_init`          | Baseline tables                                                         |
| 2   | `0002_add_documents` | Split file fields off permits into `documents`                          |
| 3   | `0003_add_permit_type` | Add `PermitType` enum and `permits.type`                              |

See [`prisma/migrations/README.md`](../prisma/migrations/README.md).

## ERD

```mermaid
erDiagram
  USERS ||--o{ PERMITS : owns
  USERS ||--o{ DOCUMENTS : owns
  USERS ||--o{ NORM_DOCS : owns
  USERS ||--o{ REVIEW_RUNS : starts
  PERMITS ||--o{ DOCUMENTS : has
  PERMITS ||--o{ REVIEW_RUNS : reviewed_in
  REVIEW_RUNS ||--o{ REVIEW_RUN_NORMS : includes
  NORM_DOCS ||--o{ REVIEW_RUN_NORMS : selected_in

  USERS {
    uuid id PK
    text email UK
    timestamptz created_at
  }

  PERMITS {
    uuid id PK
    uuid user_id FK
    text title
    enum type
    timestamptz created_at
  }

  DOCUMENTS {
    uuid id PK
    uuid permit_id FK
    uuid user_id FK
    enum kind
    text file_name
    bigint file_size
    text mime_type
    text storage_key
    timestamptz created_at
  }

  NORM_DOCS {
    uuid id PK
    uuid user_id FK
    text title
    enum source
    text content
    text file_name
    text source_url
    timestamptz created_at
  }

  REVIEW_RUNS {
    uuid id PK
    uuid user_id FK
    uuid permit_id FK
    text status
    text note
    timestamptz created_at
  }

  REVIEW_RUN_NORMS {
    uuid review_run_id FK
    uuid norm_doc_id FK
  }
```

## Notes

- One Postgres database for relational data and (later) vectors.
- Host port in local Compose is `5433`.
- MVP API handlers still use `src/lib/mock`. Prisma is ready for the durable wiring pass.
