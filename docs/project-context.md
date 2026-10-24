# Project context

## Goals

Build a personal Building Permit App where a user can:

1. Sign in with a mock email session.
2. Upload a building-permit PDF (stored in S3-compatible object storage).
3. Attach city-norm context (paste, upload, or a web-fetch stub).
4. View the PDF in a fixed, scrollable pane and drag to highlight findings.
5. Record a review run that will later compare the permit to selected norms with an LLM.

## Constraints (current pass)

- Work in the local clone only. Do not require a populated GitHub remote.
- Keep the first UI slice focused and runnable with `npm run dev`.
- No real OAuth or Clerk yet.
- No durable DB wiring in the app yet (Prisma migrations + Colima/Compose; API still uses mock store for metadata).
- PDF **bytes** live in LocalStack (local S3), not in the mock store.
- No real PDF OCR, embeddings, or municipal crawling yet.

## Decisions

| Topic            | Choice                                              | Why                                                       |
| ---------------- | --------------------------------------------------- | --------------------------------------------------------- |
| Framework        | Next.js App Router + TypeScript                     | Fast UI + API routes in one app                           |
| Styling          | Tailwind + shadcn/ui                                | Consistent, low-ceremony components                       |
| Auth now         | Email cookie mock (`bpa_session_email`)             | Unblocks scoped UI without provider setup                 |
| Auth later       | Clerk (recommended)                                 | Simple hosted auth for a personal deploy                  |
| Metadata now     | In-memory mock store                                | Usable MVP without wiring Prisma handlers yet             |
| PDF bytes now    | LocalStack S3 (`@aws-sdk/client-s3`) + URL/key only | Matches production shape; no AWS account locally          |
| PDF view         | react-pdf + same-origin file proxy                  | Avoid blank canvas from cross-origin / missing WASM       |
| Frontend data    | TanStack Query + `src/services/*`                   | Easy, typed fetches per endpoint                          |
| Database         | One Postgres instance with pgvector extension       | Keep vectors in the same DB when RAG is needed            |
| AI path          | Extract + pack norms into prompt first              | Avoid RAG complexity until corpora outgrow context        |
| AI providers     | Local-first, then Textract + Bedrock behind interfaces | Same pipeline; swap env later without rewrite           |
| AI design docs   | [ai-architecture.md](./ai-architecture.md), [plans/](./plans/README.md) | Review Bedrock / Textract / RAG / gaps anytime |

## Product spelling note

The repository folder is spelled `BuilddingPermitAI` (intentional existing name). Product copy uses "Building Permit App".
