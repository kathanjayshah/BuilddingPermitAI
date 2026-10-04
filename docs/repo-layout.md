# Repo layout

Folders are split by concern so docs, Prisma, Docker, and app code stay separate.

```text
README.md                 # Short project entry (quick start only)
docs/                     # All project documentation
  README.md               # Docs hub
  storage.md              # S3 / LocalStack
  frontend.md             # Services + hooks
  pdf-viewer.md           # react-pdf viewer
  api.md                  # HTTP API
  ...

prisma/                   # Prisma ORM
  schema.prisma           # Models (source of truth)
  migrations/             # Sequential migrations: 0001_..., 0002_...
    README.md             # Naming rules + why each migration exists

docker/                   # Compose / Colima container config only
  docker-compose.yml      # Postgres + LocalStack
  localstack-init/        # Creates bpa-permits bucket + CORS
docker-compose.yml        # Thin include of docker/docker-compose.yml

scripts/
  copy-pdfjs-assets.mjs   # npm run pdfjs:assets / postinstall

.cursor/skills/
  commit/SKILL.md         # Conventional Commits workflow for agents
AGENTS.md                 # Next.js agent rules + commit pointers

public/
  pdf.worker.min.mjs      # PDF.js worker (committed)
  pdfjs/                  # wasm/cmaps/fonts (generated, gitignored)

src/
  app/                    # Next.js pages + thin /api route entrypoints
  api/                    # API handler logic
  services/               # Frontend fetch helpers (one per API area)
  hooks/                  # TanStack Query hooks
  components/             # UI (layout, pages, pdf, ui)
  lib/
    db/                   # Prisma client
    mock/                 # In-memory MVP store (metadata; no PDF bytes)
    session/              # Mock email cookie helpers
    storage/              # S3 upload + getObject
    query-keys.ts         # React Query keys
```

## Rules of thumb

| Put it here                                                                                                   | Not here                                                                                         |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Docs / guides → `docs/`                                                                                       | Do not leave long docs next to Docker or Prisma                                                  |
| Schema change → `prisma/schema.prisma`, next `000N_name` migration, note why in `prisma/migrations/README.md` | Do not hand-edit applied migration folders; do not use opaque timestamp names as the readable id |
| Compose / Postgres / LocalStack → `docker/`                                                                   | Do not put app code in `docker/`                                                                 |
| Browser API calls → `src/services/*` then hooks                                                               | Do not `fetch` API routes directly from page components                                          |
| S3 helpers → `src/lib/storage/`                                                                               | Do not keep PDF bytes in the mock store                                                          |
