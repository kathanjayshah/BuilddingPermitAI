"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermitPdfViewer } from "@/components/pdf/permit-pdf-viewer";
import { useAddPermitDocument, usePermits } from "@/hooks/use-permits";
import type { DocumentRecord } from "@/lib/types";

type Props = {
  permitId: string;
};

export function PermitPdfPage({ permitId }: Props) {
  const permitsQuery = usePermits(true);
  const addDocument = useAddPermitDocument(permitId);
  const permit = permitsQuery.data?.find((p) => p.id === permitId) ?? null;
  const documents = permit?.documents ?? [];
  const pdfDocuments = useMemo(
    () => documents.filter((d) => d.kind === "pdf"),
    [documents],
  );
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!documents.length) {
      setSelectedDocId(null);
      return;
    }
    setSelectedDocId((current) => {
      if (current && documents.some((d) => d.id === current)) return current;
      return (
        pdfDocuments[0]?.id ??
        documents.find((d) => d.kind === "image")?.id ??
        documents[0]!.id
      );
    });
  }, [documents, pdfDocuments]);

  const selected = documents.find((d) => d.id === selectedDocId) ?? null;

  if (permitsQuery.isLoading) {
    return (
      <div className="flex h-[calc(100dvh-4.75rem)] items-center justify-center px-4 text-sm text-muted-foreground">
        Loading permit…
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-4.75rem)] w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium">Permit not found</p>
        <p className="text-sm text-muted-foreground">
          Open a file from the permits list.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-4.75rem)] w-full max-w-6xl flex-col gap-3 px-4 py-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="permit-document">Document</Label>
          <select
            id="permit-document"
            className="flex h-9 w-full max-w-md rounded-lg border border-input bg-background px-3 text-sm"
            value={selectedDocId ?? ""}
            onChange={(e) => setSelectedDocId(e.target.value || null)}
          >
            {documents.length === 0 ? (
              <option value="">No documents yet</option>
            ) : (
              documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.fileName} ({doc.kind})
                </option>
              ))
            )}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="add-document-file">Add document</Label>
          <Input
            id="add-document-file"
            type="file"
            accept="application/pdf,.pdf,image/*"
            disabled={addDocument.isPending}
            className="max-w-xs"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploadError(null);
              try {
                const result = await addDocument.mutateAsync(file);
                setSelectedDocId(result.document.id);
              } catch (err) {
                setUploadError(
                  err instanceof Error ? err.message : "Upload failed.",
                );
              }
              event.target.value = "";
            }}
          />
        </div>
      </div>
      {uploadError ? (
        <p className="text-sm text-destructive" role="alert">
          {uploadError}
        </p>
      ) : null}

      <div className="min-h-0 flex-1">
        <DocumentPane document={selected} />
      </div>
    </div>
  );
}

function DocumentPane({ document }: { document: DocumentRecord | null }) {
  if (!document) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
        Add a PDF or image to this permit.
      </div>
    );
  }

  if (document.kind === "image") {
    return (
      <div className="flex h-full overflow-auto rounded-lg border bg-muted/20 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/documents/${encodeURIComponent(document.id)}/file`}
          alt={document.fileName}
          className="mx-auto max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  return <PermitPdfViewer documentId={document.id} />;
}
