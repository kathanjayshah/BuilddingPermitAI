# Object storage (S3 / LocalStack)

Permit PDFs are **not** stored as bytes in the app DB or in-memory store. Only metadata is kept in the mock store (`storageKey` + `fileUrl`). The file body lives in S3-compatible object storage.

## Upload → view flow

```text
Browser                Next.js API                 LocalStack / S3
   |                        |                            |
   |-- POST /api/permits -->|                            |
   |   (multipart PDF)      |-- PutObject -------------->|
   |                        |   key: permits/{email}/... |
   |                        |-- save storageKey+fileUrl  |
   |<- { permit } ----------|   (mock store / later DB)  |
   |                        |                            |
   |-- GET .../file ------->|-- GetObject -------------->|
   |   (same-origin proxy)  |<- PDF bytes ---------------|
   |<- application/pdf -----|                            |
   |                        |                            |
   |  react-pdf renders the proxied URL in the viewer    |
```

1. Browser uploads a PDF or image to `POST /api/permits` (creates permit + first document) or `POST /api/permits/:id/documents`
2. Server (`src/lib/storage/s3.ts`) writes the object with `@aws-sdk/client-s3`
3. Server saves `storageKey` + `fileUrl` on the **document** record (permit keeps only title + relations)
4. Viewer asks `GET /api/documents/:id/file?meta=1` for the same-origin proxy path
5. react-pdf (or `<img>`) loads `GET /api/documents/:id/file`, which **proxies** bytes from S3

### Why proxy?

Do **not** point react-pdf at the raw LocalStack/S3 URL (`localhost:4566`). Cross-origin fetches often produce a blank white canvas even when the object exists. The browser always loads the file via the Next.js same-origin route.

### Code map

| Piece | Path |
| --- | --- |
| S3 client + upload/get | `src/lib/storage/s3.ts` |
| Create permit + first doc | `src/api/permits.ts` |
| Add doc to permit | `src/api/permit-documents.ts` |
| File proxy / meta | `src/api/document-file.ts` |
| Frontend helpers | `src/services/permits-service.ts` |
| Viewer hook | `src/hooks/use-permits.ts` → `useDocumentFileUrl` |

Object key shape:

```text
permits/{email}/{permitId}/{documentId}/{originalFileName}
```

## Local: LocalStack (no AWS account)

We mimic S3 locally with **LocalStack** in Colima/Compose. Same AWS SDK code works against real AWS later by swapping env vars.

| Piece | Value |
| --- | --- |
| Image | `localstack/localstack:3` |
| Endpoint | `http://localhost:4566` |
| Access key / secret | `test` / `test` |
| Bucket | `bpa-permits` (created by init script) |
| Example object URL | `http://localhost:4566/bpa-permits/permits/.../file.pdf` |
| Init script | `docker/localstack-init/01-create-bucket.sh` |

Init creates the bucket, sets CORS for `localhost:3000`, and applies a public-read GetObject policy (handy for debugging; the app still uses the proxy).

```bash
npm run docker:up
# LocalStack S3 API: http://localhost:4566
# List objects (inside the container):
docker exec bpa-localstack awslocal s3 ls s3://bpa-permits --recursive
```

### Do you need AWS locally?

**No.** You do not need an AWS account, IAM user, or real S3 bucket for local/dev. LocalStack is enough.

### Env vars

See `.env.example` and copy into `.env.local`:

```bash
S3_ENDPOINT=http://localhost:4566
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=test
S3_SECRET_ACCESS_KEY=test
S3_BUCKET=bpa-permits
S3_PUBLIC_URL=http://localhost:4566
```

| Variable | Purpose |
| --- | --- |
| `S3_ENDPOINT` | SDK endpoint (LocalStack or custom S3-compatible API) |
| `S3_REGION` | Region string (LocalStack ignores; AWS needs a real one) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Credentials |
| `S3_BUCKET` | Bucket name |
| `S3_PUBLIC_URL` | Base used when building stored `fileUrl` metadata |

`src/lib/storage/s3.ts` uses `forcePathStyle: true` so LocalStack path-style URLs work (`/{bucket}/{key}`).

## Production

Point the same env vars at real AWS S3 (or Cloudflare R2, etc.):

- Set real credentials and bucket
- Often omit a custom `endpoint` for AWS (or keep it for R2)
- Keep `forcePathStyle` only if the provider needs path-style URLs
- Prefer private buckets + signed URLs or keep the app-side proxy

Also see [deployment.md](./deployment.md).

## Reset note

`npm run db:reset` runs `docker compose down -v`, which **wipes Postgres and LocalStack volumes**. Bucket contents are lost; the init script recreates an empty `bpa-permits` bucket on the next up.
