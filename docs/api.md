# HTTP API

Thin Next.js routes under `src/app/api/*` re-export handlers from `src/api/*`. All routes (except creating a session) expect the mock cookie `bpa_session_email`.

Frontend clients should use `src/services/*` (see [frontend.md](./frontend.md)).

## Session

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/api/session` | — | `{ email }` or `{ email: null }` |
| `POST` | `/api/session` | `{ email }` | `{ email }` + sets httpOnly cookie |
| `DELETE` | `/api/session` | — | `{ ok: true }` clears cookie |

## Permits

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/api/permits` | — | `{ permits }` each with nested `documents[]` |
| `POST` | `/api/permits` | `multipart` `file` (PDF or image); optional `title` | Creates permit + first document (201) |
| `GET` | `/api/permits/:id/documents` | — | `{ documents }` |
| `POST` | `/api/permits/:id/documents` | `multipart` `file` | Adds a document to the permit (201) |
| `GET` | `/api/permits/:id/file` | — | Redirects to the first PDF document file route |

`PermitRecord`: `id`, `email`, `title`, `createdAt`, `documents[]`.

## Documents

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/api/documents/:id/file` | File bytes proxied from S3 |
| `GET` | `/api/documents/:id/file?meta=1` | `{ url, storageKey, fileUrl, fileName, mimeType, kind, permitId }` |

`DocumentRecord`: `id`, `permitId`, `email`, `kind` (`pdf` \| `image`), `fileName`, `fileSize`, `mimeType`, `storageKey`, `fileUrl`, `createdAt`.

## Norms

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/norms` | List for session email |
| `POST` | `/api/norms` | Paste text, upload, or web stub |

## Reviews

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/reviews` | Stub review runs |
| `POST` | `/api/reviews` | `{ permitId, normIds }` → queued/stubbed run (no LLM) |

## Highlights

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/highlights?documentId=` | List for a document |
| `POST` | `/api/highlights` | Create rect + note (`documentId` required) |
| `DELETE` | `/api/highlights?id=` | Delete one highlight |

## Auth errors

Missing/invalid session → `401` with `{ error: "Unauthorized" }` (or similar).
