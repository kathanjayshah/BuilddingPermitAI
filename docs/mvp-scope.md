# MVP scope

## Included

- Open app, enter email, enter, mock session cookie, dashboard scoped to that email
- Collapsible sidebar workspace: Dashboard, Permits, City norms, Reviews
- Permit PDF upload UI + API; bytes go to LocalStack S3; mock store keeps `storageKey` + `fileUrl` only
- Same-origin `GET /api/permits/:id/file` proxy for the viewer
- Open a permit from the table at `/permits/[id]` (react-pdf, scroll + highlights); file name in the top bar
- PDF.js worker + WASM assets (`npm run pdfjs:assets` / postinstall)
- Frontend `src/services/*` + TanStack Query hooks per API area
- TanStack Table on list pages
- City-norm context UI + API: paste and/or upload; web-fetch stub hook for later
- Stub review-run API that records selected permit + norms (no real LLM call)
- Compose Postgres + pgvector on host port `5433` (Colima)
- Compose LocalStack S3 on host port `4566` (bucket `bpa-permits`)
- Prisma schema + migrations under `prisma/` applied with `npm run db:migrate`
- Docs under `docs/` (storage, frontend, API, PDF viewer, Colima/local, deployment)

## Excluded

- Real auth provider (OAuth, magic links, SSO)
- Wiring the app to durable Postgres reads/writes
- Real PDF text extraction / OCR
- Embeddings and retrieval-augmented generation
- Crawling municipal websites for norms
- Redis, job queues, billing, teams/orgs
- Production hardening (rate limits, virus scanning uploads, etc.)

## Auth timeline

| Phase | Approach                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| Now   | Mock email via `POST /api/session` and cookie `bpa_session_email`                                                               |
| Later | Clerk (recommended). Replace the cookie session with Clerk session middleware and map Clerk user email to the same domain model |

## Success criteria for this pass

A developer can clone, `npm install`, start Colima + `npm run docker:up`, copy `.env.example` → `.env.local`, `npm run dev`, sign in with any email, upload a PDF to LocalStack, scroll/view it, add highlights, attach norms, and create a stub review run without a real AWS account or LLM.
