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
import { Input } from "@/components/ui/input";

export function PermitsPage() {
  const router = useRouter();
  const permitsQuery = usePermits(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");

  const permits = permitsQuery.data;
  const filteredPermits = useMemo(() => {
    const list = permits ?? [];
    const q = search.trim().toLowerCase();
    return q ? list.filter((p) => p.title.toLowerCase().includes(q)) : list;
  }, [permits, search]);
  const listIsEmpty = (permits?.length ?? 0) === 0;

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
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
    ],
    [],
  );

  function openPermit(id: string) {
    router.push(`/permits/${encodeURIComponent(id)}`);
  }

  return (
    <PageFrame
      actions={
        <Button type="button" onClick={() => setUploadOpen(true)}>
          <Upload className="size-4" />
          New permit
        </Button>
      }
    >
            <div className="space-y-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search permits by title…"
          aria-label="Search permits by title"
          className="max-w-sm"
        />
        <DataTable
          columns={columns}
          data={filteredPermits}
          isLoading={permitsQuery.isLoading}
          emptyMessage={
            listIsEmpty
              ? "No permits yet. Create a permit and attach a document."
              : "No matches."
          }
          getRowId={(row) => row.id}
          onRowClick={(row) => openPermit(row.id)}
        />
      </div>
      <UploadPermitModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(id) => openPermit(id)}
      />
    </PageFrame>
  );
}
