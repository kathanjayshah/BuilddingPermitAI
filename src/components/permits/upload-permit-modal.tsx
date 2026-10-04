"use client";

import { useEffect, useId, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadPermit } from "@/hooks/use-permits";

type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded: (permitId: string) => void;
};

export function UploadPermitModal({ open, onClose, onUploaded }: Props) {
  const titleId = useId();
  const uploadPermit = useUploadPermit();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close upload modal"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-xl border bg-background p-5 shadow-lg"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-md border bg-muted/40 p-2">
            <Upload className="size-4" />
          </div>
          <div>
            <h2 id={titleId} className="text-base font-semibold">
              New permit
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a PDF or image. This creates a permit and attaches the
              file as a document.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="upload-permit-file">PDF or image</Label>
            <Input
              id="upload-permit-file"
              type="file"
              accept="application/pdf,.pdf,image/*"
              disabled={uploadPermit.isPending}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setError(null);
                try {
                  const result = await uploadPermit.mutateAsync(file);
                  onUploaded(result.permit.id);
                  onClose();
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Upload failed.",
                  );
                }
              }}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploadPermit.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
