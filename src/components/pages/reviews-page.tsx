"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Sparkles } from "lucide-react";
import { PageFrame } from "@/components/layout/page-frame";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [open, setOpen] = useState(false);
  const [permitId, setPermitId] = useState("");
  const [selectedNormIds, setSelectedNormIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const permits = permitsQuery.data ?? [];
  const norms = normsQuery.data ?? [];

  const columns = useMemo<ColumnDef<ReviewRun>[]>(() => {
    const titleById = new Map(
      (permitsQuery.data ?? []).map((p) => [p.id, p.title]),
    );
    return [
      {
        accessorKey: "permitId",
        header: "Permit",
        cell: ({ row }) => (
          <span className="font-medium">
            {titleById.get(row.original.permitId) ?? row.original.permitId}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge>{row.original.status}</Badge>,
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
    ];
  }, [permitsQuery.data]);

  async function runReview() {
    const result = await createReview.mutateAsync({
      permitId,
      normIds: selectedNormIds,
    });
    setMessage(result.review.note);
    setPermitId("");
    setSelectedNormIds([]);
    setOpen(false);
  }

  return (
    <PageFrame
      actions={
        <Button type="button" onClick={() => setOpen(true)}>
          <Sparkles className="size-4" />
          New review
        </Button>
      }
    >
      {message ? (
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={reviewsQuery.data ?? []}
        isLoading={reviewsQuery.isLoading}
        emptyMessage="No review runs yet. Click “New review” to start one."
        getRowId={(row) => row.id}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New review</DialogTitle>
            <DialogDescription>
              Pick a permit and the norms to check it against.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="review-permit">Permit</Label>
              <Select
                value={permitId || null}
                onValueChange={(value) => setPermitId(value ?? "")}
              >
                <SelectTrigger id="review-permit" className="w-full">
                  <SelectValue placeholder="Select a permit...">
                    {(value) => {
                      const permit = permits.find((p) => p.id === value);
                      return permit
                        ? `${permit.title} (${labelPermitType(permit.type)})`
                        : "Select a permit...";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {permits.map((permit) => (
                    <SelectItem key={permit.id} value={permit.id}>
                      {permit.title} ({labelPermitType(permit.type)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Norms</Label>
              <div className="max-h-48 space-y-2 overflow-auto rounded-md border p-2">
                {norms.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No norms yet. Add one on the City norms page first.
                  </p>
                ) : (
                  norms.map((norm) => (
                    <label
                      key={norm.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Checkbox
                        className="mt-1"
                        checked={selectedNormIds.includes(norm.id)}
                        onCheckedChange={() =>
                          setSelectedNormIds((prev) =>
                            prev.includes(norm.id)
                              ? prev.filter((id) => id !== norm.id)
                              : [...prev, norm.id],
                          )
                        }
                      />
                      <span className="font-medium">{norm.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={
                createReview.isPending ||
                !permitId ||
                selectedNormIds.length === 0
              }
              onClick={runReview}
            >
              Run stub review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
}
