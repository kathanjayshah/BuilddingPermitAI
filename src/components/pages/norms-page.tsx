"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageFrame } from "@/components/layout/page-frame";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCreateNorm, useNorms, useUploadNorm } from "@/hooks/use-norms";
import type { NormRecord } from "@/lib/types";

export function NormsPage() {
  const normsQuery = useNorms(true);
  const createNorm = useCreateNorm();
  const uploadNorm = useUploadNorm();
  const [normTitle, setNormTitle] = useState("");
  const [normContent, setNormContent] = useState("");
  const [webTitle, setWebTitle] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<NormRecord>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {row.original.content}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.source}</Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
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

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          className="space-y-3 rounded-lg border p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const result = await createNorm.mutateAsync({
              title: normTitle,
              content: normContent,
              source: "paste",
            });
            setNormTitle("");
            setNormContent("");
            setMessage(`Norm saved: ${result.norm.title}`);
          }}
        >
          <p className="text-sm font-medium">Paste norm</p>
          <div className="space-y-2">
            <Label htmlFor="norm-title">Title</Label>
            <Input
              id="norm-title"
              value={normTitle}
              onChange={(e) => setNormTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="norm-content">Content</Label>
            <Textarea
              id="norm-content"
              value={normContent}
              onChange={(e) => setNormContent(e.target.value)}
              rows={4}
              required
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            disabled={createNorm.isPending}
          >
            Save pasted norm
          </Button>
        </form>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="norm-file">Upload text/doc</Label>
            <Input
              id="norm-file"
              type="file"
              disabled={uploadNorm.isPending}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const result = await uploadNorm.mutateAsync(file);
                setMessage(`Norm uploaded: ${result.norm.title}`);
                e.target.value = "";
              }}
            />
          </div>
          <Separator />
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const result = await createNorm.mutateAsync({
                title: webTitle,
                source: "web_stub",
                sourceUrl: webUrl,
              });
              setWebTitle("");
              setWebUrl("");
              setMessage(`Web stub recorded: ${result.norm.sourceUrl}`);
            }}
          >
            <p className="text-sm font-medium">Web-fetch stub</p>
            <div className="space-y-2">
              <Label htmlFor="web-title">Title</Label>
              <Input
                id="web-title"
                value={webTitle}
                onChange={(e) => setWebTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="web-url">URL</Label>
              <Input
                id="web-url"
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={createNorm.isPending}
            >
              Record stub
            </Button>
          </form>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={normsQuery.data ?? []}
        isLoading={normsQuery.isLoading}
        emptyMessage="No norms yet."
        getRowId={(row) => row.id}
      />
    </PageFrame>
  );
}
