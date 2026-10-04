# Documentation hub

All project writing lives in this folder. The root `README.md` is only a short quick start.

| Doc                                          | Purpose                                                         |
| -------------------------------------------- | --------------------------------------------------------------- |
| [repo-layout.md](./repo-layout.md)           | Folder structure (docs, prisma, docker, src)                    |
| [project-context.md](./project-context.md)   | Goals, constraints, and key decisions                           |
| [mvp-scope.md](./mvp-scope.md)               | Includes and excludes for this pass                             |
| [frontend.md](./frontend.md)                 | Services, hooks, TanStack, workspace UI                         |
| [api.md](./api.md)                           | HTTP endpoints                                                  |
| [storage.md](./storage.md)                   | LocalStack / S3, PDF proxy, env vars                            |
| [pdf-viewer.md](./pdf-viewer.md)             | react-pdf, WASM assets, scrollable viewer, highlights           |
| [ai-architecture.md](./ai-architecture.md)   | PDF extract + prompt packing first; pgvector RAG later          |
| [prisma.md](./prisma.md)                     | Prisma ORM workflow, client, sequential migrations              |
| [database.md](./database.md)                 | Schema overview, ERD, migrate commands                          |
| [docker-and-local.md](./docker-and-local.md) | Colima, Compose (Postgres + LocalStack), env, run instructions  |
| [deployment.md](./deployment.md)             | Personal deploy path (Vercel + managed Postgres + real S3)      |
| [commits.md](./commits.md)                   | Conventional Commits format + examples                          |

Agent rules (not under `docs/`):

- `.cursor/rules/asd-ste100.mdc` — reply in ASD-STE100 each time
- `.cursor/skills/commit/SKILL.md` — commit message workflow
- `AGENTS.md` — Next.js notes + project agent pointers

Related code folders (not docs):

- `prisma/` for schema + sequential migrations
- `prisma/migrations/README.md` for migration changelog
- `docker/` for Compose config + LocalStack init
- `src/lib/db/` for Prisma client
- `src/lib/storage/` for S3 helpers
- `src/services/` for frontend API clients
- `scripts/copy-pdfjs-assets.mjs` for PDF.js WASM/cmaps copy
