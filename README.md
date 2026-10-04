# Building Permit App

Personal MVP for uploading a building-permit PDF, attaching city-norm context, highlighting findings in a scrollable viewer, and recording stub review runs. Auth is a mock email session cookie (no OAuth).

Full documentation lives in [`docs/`](docs/README.md). Folder roles are explained in [`docs/repo-layout.md`](docs/repo-layout.md).

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- TanStack Query + TanStack Table; frontend API clients in `src/services/`
- react-pdf (PDF.js) viewer with local WASM assets for scanned permits
- Prisma + Postgres (pgvector image) for schema/migrations
- In-memory mock store for MVP **metadata** (Prisma ready for the durable wiring pass)
- LocalStack S3 for PDF **bytes** (no AWS account locally)
- Colima + Compose for local Postgres + LocalStack

## Quick start

```bash
npm install
# postinstall: prisma generate + copy PDF.js wasm/cmaps into public/pdfjs/

colima start
docker context use colima
cp .env.example .env.local   # once (includes DATABASE_URL + S3_*)
npm run docker:up            # Postgres :5433 + LocalStack S3 :4566
npm run db:migrate

npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any email, upload a PDF (stored in LocalStack), open **PDF viewer** to scroll pages and drag highlights.

More detail: [docs/docker-and-local.md](docs/docker-and-local.md), [docs/storage.md](docs/storage.md), [docs/pdf-viewer.md](docs/pdf-viewer.md).

## Scripts

| Command                  | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `npm run dev`            | Next.js dev server                                       |
| `npm run build`          | Production build                                         |
| `npm run format`         | Format the repo with Prettier                            |
| `npm run format:check`   | Check formatting without writing                         |
| `npm run docker:up`      | Start Postgres + LocalStack via Compose                  |
| `npm run docker:down`    | Stop Compose services                                    |
| `npm run db:migrate`     | Apply Prisma migrations                                  |
| `npm run db:migrate:dev` | Create/apply migrations while developing                 |
| `npm run db:reset`       | Wipe Compose volumes (DB **and** LocalStack) + re-migrate |
| `npm run db:studio`      | Open Prisma Studio                                       |
| `npm run pdfjs:assets`   | Copy PDF.js wasm/cmaps/fonts into `public/pdfjs/`        |

## Docs

| Path                                                         | Contents                              |
| ------------------------------------------------------------ | ------------------------------------- |
| [`docs/`](docs/README.md)                                    | All guides and design notes           |
| [`docs/storage.md`](docs/storage.md)                         | LocalStack / S3 + PDF proxy           |
| [`docs/frontend.md`](docs/frontend.md)                       | Services, hooks, workspace UI         |
| [`docs/pdf-viewer.md`](docs/pdf-viewer.md)                   | react-pdf, WASM, scrollable viewer    |
| [`docs/api.md`](docs/api.md)                                 | HTTP endpoints                        |
| [`prisma/`](prisma/)                                         | Prisma schema + sequential migrations |
| [`docs/prisma.md`](docs/prisma.md)                           | Prisma workflow guide                 |
| [`docker/`](docker/)                                         | Compose (Postgres + LocalStack)       |
