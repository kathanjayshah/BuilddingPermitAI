# Deployment (personal path)

Suggested path for a solo / personal deploy once the MVP grows past local mocks.

## Frontend + API

Deploy the Next.js app to **Vercel**.

1. Push the repo to GitHub (or another Git host Vercel supports).
2. Import the project in Vercel.
3. Set environment variables (see below).
4. Deploy. Preview deployments cover branches; production tracks the default branch.

Build already runs `postinstall` → `prisma generate` + `pdfjs:assets`. Ensure the install step can copy from `node_modules/pdfjs-dist` into `public/pdfjs/`.

## Environment variables (production)

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Managed Postgres with pgvector |
| `S3_ENDPOINT` | Omit for AWS; set for R2 / custom endpoints |
| `S3_REGION` | Real AWS region (or provider equivalent) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Bucket credentials |
| `S3_BUCKET` | Production bucket name |
| `S3_PUBLIC_URL` | Public/CDN base if you expose objects; otherwise keep using the app proxy |
| Clerk keys (later) | When replacing mock session |

LocalStack values (`test` / `localhost:4566`) must **not** be used in production.

## Database

Use a **managed Postgres** with pgvector support, for example:

- Neon
- Supabase
- Another host that can install/enable the `vector` extension

Point `DATABASE_URL` at that instance. Apply migrations from [database.md](./database.md) / [prisma.md](./prisma.md). Wire API handlers off the mock store onto Prisma when ready.

## Object storage

PDF upload already uses `@aws-sdk/client-s3` ([storage.md](./storage.md)). For production:

1. Create a private bucket (S3, Cloudflare R2, or similar).
2. Set the `S3_*` env vars on Vercel.
3. Prefer keeping the same-origin `/api/permits/:id/file` proxy (or switch to short-lived signed URLs).
4. Store only `storageKey` / URL metadata in Postgres.

## Auth (later)

Replace the email cookie mock with **Clerk**:

1. Create a Clerk application.
2. Add Clerk middleware to protect workspace routes and API routes.
3. Map Clerk user email (or user id) onto the `users` table.
4. Remove `POST /api/session` mock cookie once Clerk is live.

## What not to deploy yet

- Relying on the in-memory store in production (it resets per serverless instance)
- Calling an LLM without cost controls and logging
- Public upload endpoints without size limits and auth
- LocalStack credentials or open public-read buckets without review

## Minimal production checklist

- [ ] Managed Postgres with `vector` extension available
- [ ] Real S3-compatible bucket + `S3_*` secrets on the host
- [ ] Real auth (Clerk recommended)
- [ ] App wired to Postgres instead of the memory store
- [ ] PDF.js assets available at build (`pdfjs:assets`)
- [ ] Secrets only in the host env (never committed)
