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
| `GET` | `/api/permits` | — | `{ permits: PermitRecord[] }` |
| `POST` | `/api/permits` | `multipart/form-data` field `file` (PDF) | `{ permit }` (201); uploads to S3 |
| `GET` | `/api/permits/:id/file` | — | PDF bytes (`Content-Type: application/pdf`) proxied from S3 |
| `GET` | `/api/permits/:id/file?meta=1` | — | `{ url, storageKey, fileUrl, fileName, mimeType }` |

`PermitRecord` fields (in-memory today): `id`, `email`, `fileName`, `fileSize`, `mimeType`, `storageKey`, `fileUrl`, `createdAt`.

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
| `GET` | `/api/highlights?permitId=` | List for a permit |
| `POST` | `/api/highlights` | Create rect + note |
| `DELETE` | `/api/highlights?id=` | Delete one highlight |

## Auth errors

Missing/invalid session → `401` with `{ error: "Unauthorized" }` (or similar).
