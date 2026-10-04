"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Upload } from "lucide-react";
import { PageFrame } from "@/components/layout/page-frame";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { UploadPermitModal } from "@/components/permits/upload-permit-modal";
import { usePermits } from "@/hooks/use-permits";
import type { PermitRecord } from "@/lib/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PermitsPage() {
  const router = useRouter();
  const permitsQuery = usePermits(true);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const columns = useMemo<ColumnDef<PermitRecord>[]>(
    () => [
      {
        accessorKey: "fileName",
        header: "File",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.fileName}</span>
        ),
      },
      {
        accessorKey: "fileSize",
        header: "Size",
        cell: ({ row }) => formatBytes(row.original.fileSize),
      },
      {
        accessorKey: "createdAt",
        header: "Uploaded",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
    ],
    [],
  );

  return (
    <PageFrame>
      <div className="flex justify-end">
        <Button type="button" onClick={() => setUploadOpen(true)}>
          <Upload className="size-4" />
          Upload PDF
        </Button>
      </div>
      {message ? (
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={permitsQuery.data ?? []}
        isLoading={permitsQuery.isLoading}
        emptyMessage="No permits yet. Upload a PDF to get started."
        getRowId={(row) => row.id}
        onRowClick={(row) =>
          router.push(`/viewer?permitId=${encodeURIComponent(row.id)}`)
        }
      />
      <UploadPermitModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(id) => {
          setMessage("Permit uploaded.");
          router.push(`/viewer?permitId=${encodeURIComponent(id)}`);
        }}
      />
    </PageFrame>
  );
}
