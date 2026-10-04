"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useCreateHighlight,
  useDeleteHighlight,
  useHighlights,
} from "@/hooks/use-highlights";
import { useDocumentFileUrl } from "@/hooks/use-permits";
import type { PdfHighlight } from "@/lib/types";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/** JPEG2000/JBIG2 scanned permits need these local PDF.js assets. */
function usePdfDocumentOptions() {
  return useMemo(
    () => ({
      wasmUrl: "/pdfjs/wasm/",
      cMapUrl: "/pdfjs/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "/pdfjs/standard_fonts/",
      iccUrl: "/pdfjs/iccs/",
      disableRange: true,
      disableStream: true,
    }),
    [],
  );
}

type DragState = {
  page: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

type Props = {
  documentId: string | null;
};

function toPercentRect(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  width: number,
  height: number,
) {
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const right = Math.max(startX, currentX);
  const bottom = Math.max(startY, currentY);
  return {
    x: (left / width) * 100,
    y: (top / height) * 100,
    width: ((right - left) / width) * 100,
    height: ((bottom - top) / height) * 100,
  };
}

export function PermitPdfViewer({ documentId }: Props) {
  const [note, setNote] = useState("Issue to review");
  const fileUrlQuery = useDocumentFileUrl(documentId, Boolean(documentId));
  const highlightsQuery = useHighlights(documentId, Boolean(documentId));
  const createHighlight = useCreateHighlight(documentId);
  const deleteHighlight = useDeleteHighlight(documentId);
  const highlights = highlightsQuery.data ?? [];
  const pdfOptions = usePdfDocumentOptions();

  if (!documentId) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border px-4 text-center text-sm text-muted-foreground">
        Select a PDF document to view it here.
      </div>
    );
  }

  if (fileUrlQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border px-4 text-center text-sm text-muted-foreground">
        Loading PDF from storage...
      </div>
    );
  }

  if (fileUrlQuery.isError || !fileUrlQuery.data) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border px-4 text-center text-sm text-destructive">
        {fileUrlQuery.error?.message ?? "PDF unavailable for this permit."}
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
      <PdfScrollPane
        key={documentId}
        documentId={documentId}
        fileUrl={fileUrlQuery.data}
        pdfOptions={pdfOptions}
        note={note}
        highlights={highlights}
        onCreateHighlight={async (payload) => {
          await createHighlight.mutateAsync(payload);
        }}
      />

      <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto sm:border-l sm:pl-3">
        <div className="space-y-2">
          <Label htmlFor="hl-note">Highlight note</Label>
          <Input
            id="hl-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Setback concern"
          />
        </div>
        <div className="min-h-0 space-y-2">
          <p className="text-sm font-medium">Highlights</p>
          {highlightsQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : highlights.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              None yet. Drag on a page to add one.
            </p>
          ) : (
            <ul className="space-y-2">
              {highlights.map((h) => (
                <li key={h.id} className="rounded-md border px-2 py-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="secondary">p.{h.page}</Badge>
                      <p className="mt-1">{h.note}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => deleteHighlight.mutate(h.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

type CreateHighlightPayload = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  note: string;
  color: string;
};

type PdfDocumentOptions = {
  wasmUrl: string;
  cMapUrl: string;
  cMapPacked: boolean;
  standardFontDataUrl: string;
  iccUrl: string;
  disableRange: boolean;
  disableStream: boolean;
};

type PdfScrollPaneProps = {
  documentId: string;
  fileUrl: string;
  pdfOptions: PdfDocumentOptions;
  note: string;
  highlights: PdfHighlight[];
  onCreateHighlight: (payload: CreateHighlightPayload) => Promise<void>;
};

function PdfScrollPane({
  documentId,
  fileUrl,
  pdfOptions,
  note,
  highlights,
  onCreateHighlight,
}: PdfScrollPaneProps) {
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [pageWidth, setPageWidth] = useState(640);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pageEls = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setPageWidth(Math.max(280, Math.min(760, el.clientWidth - 24)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fileUrl]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || pageCount === 0) return;

    function updateCurrentPage() {
      if (!scroller) return;
      const scrollerRect = scroller.getBoundingClientRect();
      const marker = scrollerRect.top + scrollerRect.height / 3;
      let bestPage = 1;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let page = 1; page <= pageCount; page += 1) {
        const node = pageEls.current.get(page);
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const distance = Math.abs(mid - marker);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestPage = page;
        }
      }
      setCurrentPage((prev) => (prev === bestPage ? prev : bestPage));
    }

    updateCurrentPage();
    scroller.addEventListener("scroll", updateCurrentPage, { passive: true });
    return () => scroller.removeEventListener("scroll", updateCurrentPage);
  }, [pageCount, pageWidth]);

  function onPointerDown(
    page: number,
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    const target = pageEls.current.get(page);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setDrag({ page, startX: x, startY: y, currentX: x, currentY: y });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(
    page: number,
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (!drag || drag.page !== page) return;
    const target = pageEls.current.get(page);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setDrag({
      ...drag,
      currentX: event.clientX - rect.left,
      currentY: event.clientY - rect.top,
    });
  }

  async function onPointerUp(page: number) {
    if (!drag || drag.page !== page) {
      setDrag(null);
      return;
    }
    const target = pageEls.current.get(page);
    if (!target) {
      setDrag(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    const box = toPercentRect(
      drag.startX,
      drag.startY,
      drag.currentX,
      drag.currentY,
      rect.width,
      rect.height,
    );
    setDrag(null);
    if (box.width < 1 || box.height < 1) return;
    await onCreateHighlight({
      page: drag.page,
      ...box,
      note,
      color: "#facc15",
    });
  }

  const draftEl = drag ? pageEls.current.get(drag.page) : null;
  const draft =
    drag && draftEl
      ? toPercentRect(
          drag.startX,
          drag.startY,
          drag.currentX,
          drag.currentY,
          draftEl.getBoundingClientRect().width,
          draftEl.getBoundingClientRect().height,
        )
      : null;

  return (
    <div className="flex min-h-0 min-w-0 flex-col rounded-lg border bg-muted/20">
      <div className="flex shrink-0 items-center border-b bg-background/95 px-3 py-2 text-xs backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <span className="font-medium text-foreground">
          {loadError
            ? "Could not load PDF"
            : pageCount > 0
              ? `Page ${currentPage} of ${pageCount}`
              : "Loading pages..."}
        </span>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-3">
        <Document
          key={`${documentId}:${fileUrl}`}
          file={fileUrl}
          options={pdfOptions}
          loading={
            <p className="p-6 text-sm text-muted-foreground">Rendering...</p>
          }
          error={
            <p className="p-6 text-sm text-destructive">
              Could not render this PDF. Try uploading it again.
            </p>
          }
          onLoadSuccess={(pdf) => {
            setLoadError(null);
            setPageCount(pdf.numPages);
            setCurrentPage(1);
          }}
          onLoadError={(error) => {
            setLoadError(error.message || "PDF load failed");
            setPageCount(0);
          }}
        >
          <div className="mx-auto flex w-fit flex-col gap-4">
            {Array.from({ length: pageCount }, (_, i) => {
              const page = i + 1;
              const pageHighlights = highlights.filter((h) => h.page === page);
              return (
                <div
                  key={page}
                  ref={(node) => {
                    if (node) pageEls.current.set(page, node);
                    else pageEls.current.delete(page);
                  }}
                  className="relative w-fit touch-none select-none shadow-sm"
                  onPointerDown={(e) => onPointerDown(page, e)}
                  onPointerMove={(e) => onPointerMove(page, e)}
                  onPointerUp={() => void onPointerUp(page)}
                >
                  <Page
                    pageNumber={page}
                    width={pageWidth}
                    renderTextLayer
                    renderAnnotationLayer
                  />
                  {pageHighlights.map((h) => (
                    <HighlightBox key={h.id} highlight={h} />
                  ))}
                  {draft && drag?.page === page ? (
                    <div
                      className="pointer-events-none absolute border-2 border-amber-500 bg-amber-300/40"
                      style={{
                        left: `${draft.x}%`,
                        top: `${draft.y}%`,
                        width: `${draft.width}%`,
                        height: `${draft.height}%`,
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </Document>
      </div>
    </div>
  );
}

function HighlightBox({ highlight }: { highlight: PdfHighlight }) {
  return (
    <div
      title={highlight.note}
      className="pointer-events-none absolute border border-amber-600/70 bg-amber-300/35"
      style={{
        left: `${highlight.x}%`,
        top: `${highlight.y}%`,
        width: `${highlight.width}%`,
        height: `${highlight.height}%`,
        backgroundColor: `${highlight.color}55`,
      }}
    />
  );
}
