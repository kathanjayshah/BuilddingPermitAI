# PDF open view

Open a permit from the Permits table. Route: `/permits/[id]` (`src/components/pages/permit-pdf-page.tsx` + `src/components/pdf/permit-pdf-viewer.tsx`).

There is no separate "PDF viewer" nav item. Upload stays on `/permits` only.

## UX

- Top bar title is the **file name**
- Outer layout height is fixed so the page chrome stays put
- All PDF pages render in one column inside a **scrollable** pane (no Prev/Next)
- Drag on a page to create a highlight; notes list in the right sidebar
- Page width follows the pane via `ResizeObserver`

## How the file is loaded

1. `usePermitFileUrl` calls `permitsService.getFile(id)` → `GET /api/permits/:id/file?meta=1`
2. Meta returns a same-origin `url` like `/api/permits/:id/file`
3. `<Document file={url} />` (react-pdf) fetches that proxy; the API streams bytes from S3/LocalStack

See [storage.md](./storage.md) for why we proxy instead of using the raw S3 URL.

## react-pdf / PDF.js setup

| Piece | Location |
| --- | --- |
| Library | `react-pdf` (depends on `pdfjs-dist`) |
| Worker | `/public/pdf.worker.min.mjs` (copied from `pdfjs-dist`) |
| WASM / cmaps / fonts / ICC | `/public/pdfjs/*` (copied by script) |

Worker is set once:

```ts
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

Document options (stable `useMemo`):

```ts
{
  wasmUrl: "/pdfjs/wasm/",
  cMapUrl: "/pdfjs/cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "/pdfjs/standard_fonts/",
  iccUrl: "/pdfjs/iccs/",
  disableRange: true,
  disableStream: true,
}
```

### Blank white page on scanned permits

Many building-permit PDFs use **JPEG2000 / JBIG2** images. Without `wasmUrl` pointing at OpenJPEG/JBIG2 WASM, PDF.js logs:

```text
Dependent image isn't ready yet
JpxError: OpenJPEG failed to initialize
```

…and the canvas stays white even though page count loads.

Fix:

```bash
npm run pdfjs:assets
# also runs automatically in postinstall
```

Script: `scripts/copy-pdfjs-assets.mjs`  
Copies from `node_modules/pdfjs-dist/{wasm,cmaps,standard_fonts,iccs}` → `public/pdfjs/`.

`public/pdfjs/` is gitignored; always regenerate after `npm install`.

## Highlights

- Stored in the in-memory mock store, scoped by session email + permit id
- Geometry is percent of the page box (`x`, `y`, `width`, `height` in 0–100)
- API: `src/api/highlights.ts` / `src/services/highlights-service.ts`
