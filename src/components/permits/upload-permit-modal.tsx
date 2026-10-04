"use client";

import { useEffect, useId, useState } from "react";
import { FilePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadPermit } from "@/hooks/use-permits";
import { PERMIT_TYPES, PERMIT_TYPE_LABELS } from "@/lib/permit-types";
import type { PermitType } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded: (permitId: string) => void;
};

export function UploadPermitModal({ open, onClose, onUploaded }: Props) {
  const titleId = useId();
  const uploadPermit = useUploadPermit();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PermitType>("residential");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setType("residential");
    setFile(null);
    setError(null);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Enter a permit title.");
      return;
    }
    if (!file) {
      setError("Choose a PDF or image to attach.");
      return;
    }
    setError(null);
    try {
      const result = await uploadPermit.mutateAsync({
        file,
        title: trimmed,
        type,
      });
      onUploaded(result.permit.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create permit.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close new permit modal"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-background shadow-lg"
        onSubmit={(e) => void onSubmit(e)}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-md border bg-muted/40 p-2">
              <FilePlus className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-semibold">
                New permit
              </h2>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            disabled={uploadPermit.isPending}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-permit-title">Permit Title</Label>
            <Input
              id="new-permit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 200 E Huron commercial"
              disabled={uploadPermit.isPending}
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-permit-type">Permit type</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                if (value) setType(value as PermitType);
              }}
              disabled={uploadPermit.isPending}
            >
              <SelectTrigger
                id="new-permit-type"
                className="w-full"
                size="default"
              >
                <SelectValue>
                  {(value) =>
                    value
                      ? PERMIT_TYPE_LABELS[value as PermitType]
                      : "Select type"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PERMIT_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PERMIT_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-permit-file">Document to attach</Label>
            <Input
              id="new-permit-file"
              type="file"
              accept="application/pdf,.pdf,image/*"
              disabled={uploadPermit.isPending}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError(null);
              }}
              required
            />
            {file ? (
              <p className="truncate text-xs text-muted-foreground">
                {file.name}
              </p>
            ) : null}
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t bg-muted/20 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={uploadPermit.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={uploadPermit.isPending}>
            {uploadPermit.isPending ? "Creating..." : "Create permit"}
          </Button>
        </footer>
      </form>
    </div>
  );
}
