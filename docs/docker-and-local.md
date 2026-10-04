# Local containers (Colima) and development

This project uses **Colima** as the local container runtime (not Docker Desktop). You still use the Docker CLI and Compose (`docker compose`) against Colima's engine.

Compose config lives in `docker/docker-compose.yml`. The root `docker-compose.yml` includes that file so you can run Compose from the repo root.

Schema and migrations are managed by **Prisma** under `prisma/`. PDF bytes use LocalStack S3 (see [storage.md](./storage.md)).

## Repo layout (local infra)

```text
docs/                   # All documentation (including this file)
prisma/                 # Prisma schema + migrations
docker/                 # Compose config only
  docker-compose.yml    # Postgres + LocalStack (local S3)
  localstack-init/      # Bucket + CORS bootstrap
docker-compose.yml      # includes docker/docker-compose.yml
src/services/           # Frontend API service files
src/lib/storage/        # S3 client helpers
scripts/                # pdfjs asset copy, etc.
```

See also [repo-layout.md](./repo-layout.md), [database.md](./database.md), and [storage.md](./storage.md).

## One-time setup (macOS)

```bash
# CLI + Colima VM runtime
brew install colima docker docker-compose

# Let Docker CLI find Homebrew's Compose plugin
mkdir -p ~/.docker
```

Add this to `~/.docker/config.json` (merge with existing keys if the file already exists):

```json
{
  "cliPluginsExtraDirs": ["/opt/homebrew/lib/docker/cli-plugins"],
  "currentContext": "colima"
}
```

Start Colima:

```bash
colima start --cpu 2 --memory 4 --disk 40
docker context use colima
docker info
```

Useful Colima commands:

| Command         | Purpose                                 |
| --------------- | --------------------------------------- |
| `colima start`  | Start the VM                            |
| `colima stop`   | Stop the VM                             |
| `colima status` | Check if it is running                  |
| `colima delete` | Destroy the VM (wipes Colima disk data) |

If Docker Desktop is also installed, keep the active context on Colima:

```bash
docker context use colima
```

## Services

| Service      | Image                     | Host port       | Purpose                                    |
| ------------ | ------------------------- | --------------- | ------------------------------------------ |
| `postgres`   | `pgvector/pgvector:pg16`  | `5433` → `5432` | Prisma migrations + future durable storage |
| `localstack` | `localstack/localstack:3` | `4566`          | Local S3 API for permit PDF objects        |

The Next.js app runs on the host via `npm run dev`, not inside Compose.

LocalStack init (`docker/localstack-init/01-create-bucket.sh`) creates bucket `bpa-permits`, CORS for `localhost:3000`, and a public-read GetObject policy for debugging.

## Environment variables

```bash
cp .env.example .env.local
```

| Variable               | Example                                                               | Used now?                     |
| ---------------------- | --------------------------------------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_APP_NAME` | `Building Permit AI`                                                  | Optional label                |
| `DATABASE_URL`         | `postgresql://bpa:bpa_dev_password@localhost:5433/building_permit_ai` | Yes for Prisma CLI and client |
| `S3_ENDPOINT`          | `http://localhost:4566`                                               | LocalStack S3 endpoint        |
| `S3_REGION`            | `us-east-1`                                                           | SDK region                    |
| `S3_ACCESS_KEY_ID`     | `test`                                                                | LocalStack access key         |
| `S3_SECRET_ACCESS_KEY` | `test`                                                                | LocalStack secret key         |
| `S3_BUCKET`            | `bpa-permits`                                                         | Permit PDF bucket             |
| `S3_PUBLIC_URL`        | `http://localhost:4566`                                               | Stored `fileUrl` base         |

Postgres Compose credentials:

- User: `bpa`
- Password: `bpa_dev_password`
- Database: `building_permit_ai`

## Run instructions

### Full local stack (recommended)

```bash
npm install                 # also copies PDF.js assets to public/pdfjs/
colima start
docker context use colima
cp .env.example .env.local  # once
npm run docker:up           # Postgres + LocalStack
npm run db:migrate
npm run dev
```

### App only (no containers)

```bash
npm install
npm run dev
```

Uploads will fail until LocalStack is up and `S3_*` env vars are set.

### Reset local data

```bash
npm run db:reset
```

This runs `docker compose down -v` (wipes **Postgres and LocalStack volumes**), brings services back, and re-applies migrations. PDF objects are deleted; the bucket is recreated empty.

### Stop

```bash
npm run docker:down
colima stop
```

## PDF.js assets

Scanned permits need WASM under `public/pdfjs/`:

```bash
npm run pdfjs:assets
```

Also runs in `postinstall`. Details: [pdf-viewer.md](./pdf-viewer.md).

## Session cookie

Mock auth sets `bpa_session_email` (httpOnly, SameSite=Lax) to the raw email string. Clear it with Sign out or `DELETE /api/session`.
