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
import { labelPermitType } from "@/lib/permit-types";
import type { PermitRecord } from "@/lib/types";

export function PermitsPage() {
  const router = useRouter();
  const permitsQuery = usePermits(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const columns = useMemo<ColumnDef<PermitRecord>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => labelPermitType(row.original.type),
      },
      {
        id: "documents",
        header: "Documents",
        cell: ({ row }) => row.original.documents.length,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
    ],
    [],
  );

  function openPermit(id: string) {
    router.push(`/permits/${encodeURIComponent(id)}`);
  }

  return (
    <PageFrame>
      <div className="flex justify-end">
        <Button type="button" onClick={() => setUploadOpen(true)}>
          <Upload className="size-4" />
          New permit
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={permitsQuery.data ?? []}
        isLoading={permitsQuery.isLoading}
        emptyMessage="No permits yet. Create a permit and attach a document."
        getRowId={(row) => row.id}
        onRowClick={(row) => openPermit(row.id)}
      />
      <UploadPermitModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(id) => openPermit(id)}
      />
    </PageFrame>
  );
}
