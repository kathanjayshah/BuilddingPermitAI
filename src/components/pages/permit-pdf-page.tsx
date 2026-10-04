"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PermitPdfViewer } from "@/components/pdf/permit-pdf-viewer";
import { usePermits } from "@/hooks/use-permits";
import type { DocumentRecord } from "@/lib/types";

type Props = {
  permitId: string;
};

export function PermitPdfPage({ permitId }: Props) {
  const searchParams = useSearchParams();
  const permitsQuery = usePermits(true);
  const permit = permitsQuery.data?.find((p) => p.id === permitId) ?? null;
  const documents = useMemo(() => permit?.documents ?? [], [permit]);
  const selectedDocId = searchParams.get("documentId");

  const selected = useMemo(() => {
    if (!documents.length) return null;
    if (selectedDocId) {
      return documents.find((d) => d.id === selectedDocId) ?? null;
    }
    return (
      documents.find((d) => d.kind === "pdf") ??
      documents.find((d) => d.kind === "image") ??
      documents[0] ??
      null
    );
  }, [documents, selectedDocId]);

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
    <div className="mx-auto flex h-[calc(100dvh-4.75rem)] w-full max-w-6xl flex-col px-4 py-3">
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
