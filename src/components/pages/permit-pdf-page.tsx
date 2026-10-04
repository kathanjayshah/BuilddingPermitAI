"use client";

import { PermitPdfViewer } from "@/components/pdf/permit-pdf-viewer";
import { usePermits } from "@/hooks/use-permits";

type Props = {
  permitId: string;
};

export function PermitPdfPage({ permitId }: Props) {
  const permitsQuery = usePermits(true);
  const permit = permitsQuery.data?.find((p) => p.id === permitId) ?? null;

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
        <PermitPdfViewer permitId={permit.id} />
      </div>
    </div>
  );
}
