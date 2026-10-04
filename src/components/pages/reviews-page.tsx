"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageFrame } from "@/components/layout/page-frame";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { usePermits } from "@/hooks/use-permits";
import { useNorms } from "@/hooks/use-norms";
import { useCreateReview, useReviews } from "@/hooks/use-reviews";
import { labelPermitType } from "@/lib/permit-types";
import type { ReviewRun } from "@/lib/types";

export function ReviewsPage() {
  const permitsQuery = usePermits(true);
  const normsQuery = useNorms(true);
  const reviewsQuery = useReviews(true);
  const createReview = useCreateReview();
  const [permitId, setPermitId] = useState("");
  const [selectedNormIds, setSelectedNormIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<ReviewRun>[]>(
    () => [
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge>{row.original.status}</Badge>,
      },
      {
        accessorKey: "permitId",
        header: "Permit",
        cell: ({ row }) => (
          <code className="text-xs">{row.original.permitId}</code>
        ),
      },
      {
        accessorKey: "normIds",
        header: "Norms",
        cell: ({ row }) => row.original.normIds.length,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
      {
        accessorKey: "note",
        header: "Note",
        cell: ({ row }) => (
          <span className="line-clamp-2 text-muted-foreground">
            {row.original.note}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <PageFrame>
      {message ? (
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 rounded-lg border p-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="review-permit">Permit</Label>
          <select
            id="review-permit"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={permitId}
            onChange={(e) => setPermitId(e.target.value)}
          >
            <option value="">Select a permit...</option>
            {(permitsQuery.data ?? []).map((permit) => (
              <option key={permit.id} value={permit.id}>
                {permit.title} ({labelPermitType(permit.type)})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Norms</Label>
          <div className="max-h-40 space-y-2 overflow-auto rounded-md border p-2">
            {(normsQuery.data ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No norms yet.</p>
            ) : (
              (normsQuery.data ?? []).map((norm) => (
                <label key={norm.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedNormIds.includes(norm.id)}
                    onChange={() =>
                      setSelectedNormIds((prev) =>
                        prev.includes(norm.id)
                          ? prev.filter((id) => id !== norm.id)
                          : [...prev, norm.id],
                      )
                    }
                  />
                  <span>
                    <span className="font-medium">{norm.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {norm.source}
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Button
            disabled={
              createReview.isPending ||
              !permitId ||
              selectedNormIds.length === 0
            }
            onClick={async () => {
              const result = await createReview.mutateAsync({
                permitId,
                normIds: selectedNormIds,
              });
              setMessage(result.review.note);
            }}
          >
            Run stub review
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reviewsQuery.data ?? []}
        isLoading={reviewsQuery.isLoading}
        emptyMessage="No review runs yet."
        getRowId={(row) => row.id}
      />
    </PageFrame>
  );
}
