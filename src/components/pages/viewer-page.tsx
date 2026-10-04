"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadPermitModal } from "@/components/permits/upload-permit-modal";
import { PermitPdfViewer } from "@/components/pdf/permit-pdf-viewer";
import { usePermits } from "@/hooks/use-permits";

export function ViewerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const permitId = searchParams.get("permitId");
  const permitsQuery = usePermits(true);
  const selected = permitsQuery.data?.find((p) => p.id === permitId) ?? null;
  const [uploadOpen, setUploadOpen] = useState(false);

  const hasPermits = (permitsQuery.data?.length ?? 0) > 0;

  return (
    // Fixed outer height: chrome stays put, PDF scrolls inside.
    <div className="mx-auto flex h-[calc(100dvh-5.75rem)] w-full max-w-6xl flex-col gap-3 px-4 py-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="permit-select">Permit</Label>
          <select
            id="permit-select"
            className="flex h-9 w-full max-w-md rounded-lg border border-input bg-background px-3 text-sm"
            value={permitId ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              router.push(
                value
                  ? `/viewer?permitId=${encodeURIComponent(value)}`
                  : "/viewer",
              );
            }}
          >
            <option value="">Select a permit...</option>
            {(permitsQuery.data ?? []).map((permit) => (
              <option key={permit.id} value={permit.id}>
                {permit.fileName}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={() => setUploadOpen(true)}>
          <Upload className="size-4" />
          Upload PDF
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        {!hasPermits && !permitsQuery.isLoading ? (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
            <p className="text-sm font-medium">No permit PDFs yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a building-permit PDF to open it here and add highlights.
            </p>
            <Button
              type="button"
              className="mt-4"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="size-4" />
              Upload permit PDF
            </Button>
          </div>
        ) : (
          <PermitPdfViewer
            permitId={permitId}
            fileName={selected?.fileName}
          />
        )}
      </div>

      <UploadPermitModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(id) => {
          router.push(`/viewer?permitId=${encodeURIComponent(id)}`);
        }}
      />
    </div>
  );
}
