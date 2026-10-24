# Frontend architecture

## Stack

- Next.js App Router (route group `(workspace)` for the signed-in shell)
- TypeScript, Tailwind CSS, shadcn/ui
- TanStack Query for server state
- TanStack Table for list pages
- react-pdf (PDF.js) for the permit viewer (see [pdf-viewer.md](./pdf-viewer.md))

## UI components (required)

Prefer **shadcn/ui** primitives under `src/components/ui/` for all new UI.

- Selects, checkboxes, dialogs, menus, and similar controls: use the shadcn component. Do not use native `<select>`, `<input type="checkbox">`, or ad-hoc dropdown markup.
- Add missing primitives with `npx shadcn@latest add <name>`.
- Compose product UI from those primitives. Keep native inputs only when shadcn has no match (for example `type="file"`).

## Folder map

```text
src/
  app/(workspace)/     # Pages: /, /permits, /permits/[id], /norms, /reviews
  app/api/             # Thin route entrypoints → src/api/*
  api/                 # Request handlers (session, permits, norms, …)
  components/
    layout/            # Sidebar, topbar, workspace shell
    pages/             # Page-level compositions
    pdf/               # Permit PDF viewer
    permits/           # Upload modal
    ui/                # shadcn primitives + data-table
  hooks/               # TanStack Query hooks (one concern each)
  services/            # Frontend fetch helpers (one file per API area)
  lib/
    mock/store.ts      # In-memory records (metadata only for PDFs)
    storage/s3.ts      # Server-side S3 client
    session/           # Mock email cookie
    query-keys.ts      # Shared React Query keys
```

## Service files (use these to fetch)

Components and hooks must not scatter raw `fetch` calls. Each API area has a service under `src/services/`:

| File | Responsibility |
| --- | --- |
| `http.ts` | Shared `apiJson` + `ApiError` |
| `session-service.ts` | `GET/POST/DELETE /api/session` |
| `permits-service.ts` | list/upload permits; file proxy path + meta |
| `norms-service.ts` | list/create norms |
| `reviews-service.ts` | list/create stub review runs |
| `highlights-service.ts` | list/create/delete PDF highlights |
| `index.ts` | Re-exports |

Example:

```ts
import { permitsService } from "@/services/permits-service";

const { permits } = await permitsService.list();
await permitsService.upload(file);
const meta = await permitsService.getFile(permitId); // { url, storageKey, … }
```

## Hooks

| Hook file | Typical exports |
| --- | --- |
| `use-session.ts` | session query, sign-in/out mutations |
| `use-permits.ts` | `usePermits`, `useUploadPermit`, `usePermitFileUrl` |
| `use-norms.ts` | list + create |
| `use-reviews.ts` | list + create stub run |
| `use-highlights.ts` | list/create/delete by permit |
| `use-sidebar-collapsed.ts` | local UI preference |

Hooks call services and invalidate `queryKeys` from `src/lib/query-keys.ts`.

## Workspace UI

- `WorkspaceShell`: sidebar + sticky page topbar + main
- Sidebar: Dashboard, Permits, City norms, Reviews; brand + email at bottom; collapsible
- `PageTopbar`: title/description from `nav-items.ts` (on `/permits/[id]`, title is the file name)
- Mock auth gate: any email → cookie `bpa_session_email` (httpOnly). Cookie value is stored as the raw email (do not double-`encodeURIComponent`)

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Dashboard counts / shortcuts |
| `/permits` | TanStack Table of permit cases + create (upload first document) |
| `/permits/[id]` | Permit title in header; pick/add documents; open PDF or image |
| `/norms` | Paste / upload / web stub norms |
| `/reviews` | Stub permit-vs-norms review runs |
