"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getNavItemForPath,
  getPermitIdFromPath,
} from "@/components/layout/nav-items";
import { SHELL_HEADER_HEIGHT_CLASS } from "@/components/layout/shell-header";
import { Input } from "@/components/ui/input";
import { useAddPermitDocument, usePermits } from "@/hooks/use-permits";
import { labelPermitType } from "@/lib/permit-types";
import { cn } from "@/lib/utils";

export function PageTopbar() {
  const pathname = usePathname();
  const permitId = getPermitIdFromPath(pathname);
  const item = getNavItemForPath(pathname);
  const Icon = item.icon;

  if (permitId) {
    return <PermitDocumentTopbar permitId={permitId} />;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        SHELL_HEADER_HEIGHT_CLASS,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <h1 className="truncate text-lg font-semibold leading-snug tracking-tight">
              {item.title}
            </h1>
          </div>
          <p className="truncate text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
    </header>
  );
}

function PermitDocumentTopbar({ permitId }: { permitId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const permitsQuery = usePermits(true);
  const addDocument = useAddPermitDocument(permitId);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const permit = permitsQuery.data?.find((p) => p.id === permitId) ?? null;
  const documents = useMemo(() => permit?.documents ?? [], [permit]);
  const selectedDocId = searchParams.get("documentId");

  useEffect(() => {
    if (!permit || documents.length === 0) return;
    if (selectedDocId && documents.some((d) => d.id === selectedDocId)) return;

    const fallback =
      documents.find((d) => d.kind === "pdf")?.id ?? documents[0]!.id;
    const params = new URLSearchParams(searchParams.toString());
    params.set("documentId", fallback);
    router.replace(
      `/permits/${encodeURIComponent(permitId)}?${params.toString()}`,
    );
  }, [permit, documents, selectedDocId, permitId, router, searchParams]);

  function selectDocument(documentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (documentId) params.set("documentId", documentId);
    else params.delete("documentId");
    router.replace(
      `/permits/${encodeURIComponent(permitId)}?${params.toString()}`,
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        SHELL_HEADER_HEIGHT_CLASS,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Document</p>
            <select
              aria-label="Document"
              className="flex h-8 w-full min-w-[12rem] max-w-md rounded-lg border border-input bg-background px-2 text-sm"
              value={selectedDocId ?? ""}
              onChange={(e) => selectDocument(e.target.value)}
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
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Add document
            </p>
            <Input
              type="file"
              accept="application/pdf,.pdf,image/*"
              aria-label="Add document"
              disabled={addDocument.isPending}
              className="h-8 max-w-[14rem] py-1 text-xs"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setUploadError(null);
                try {
                  const result = await addDocument.mutateAsync(file);
                  selectDocument(result.document.id);
                } catch (err) {
                  setUploadError(
                    err instanceof Error ? err.message : "Upload failed.",
                  );
                }
                event.target.value = "";
              }}
            />
          </div>
          {uploadError ? (
            <p className="text-xs text-destructive" role="alert">
              {uploadError}
            </p>
          ) : null}
        </div>
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-semibold">
            {permit?.title ??
              (permitsQuery.isLoading ? "Loading..." : "Permit")}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {permit ? labelPermitType(permit.type) : "Permit"}
            {" · "}
            {documents.length} document{documents.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </header>
  );
}
