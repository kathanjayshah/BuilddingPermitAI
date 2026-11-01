"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageFrame } from "@/components/layout/page-frame";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateNorm, useNorms, useUploadNorm } from "@/hooks/use-norms";
import type { NormRecord } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  paste: "Pasted",
  upload: "Uploaded",
  web_stub: "Web stub",
};

export function NormsPage() {
  const normsQuery = useNorms(true);
  const createNorm = useCreateNorm();
  const uploadNorm = useUploadNorm();
  const [open, setOpen] = useState(false);
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
          <Badge variant="secondary">
            {SOURCE_LABELS[row.original.source] ?? row.original.source}
          </Badge>
        ),
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

  return (
    <PageFrame
      actions={
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add norm
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
        data={normsQuery.data ?? []}
        isLoading={normsQuery.isLoading}
        emptyMessage="No norms yet. Click “Add norm” to paste, upload, or link one."
        getRowId={(row) => row.id}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add city norm</DialogTitle>
            <DialogDescription>
              Paste text, upload a file, or record a web link.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="paste">
            <TabsList className="w-full">
              <TabsTrigger value="paste">Paste</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="web">Web link</TabsTrigger>
            </TabsList>

            <TabsContent value="paste">
              <form
                className="space-y-3 pt-3"
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
                  setOpen(false);
                }}
              >
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
                    rows={6}
                    required
                  />
                </div>
                <Button type="submit" disabled={createNorm.isPending}>
                  Save norm
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="upload">
              <div className="space-y-2 pt-3">
                <Label htmlFor="norm-file">Text or document file</Label>
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
                    setOpen(false);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  The norm is saved as soon as you choose a file.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="web">
              <form
                className="space-y-3 pt-3"
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
                  setOpen(false);
                }}
              >
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
                <Button type="submit" disabled={createNorm.isPending}>
                  Record link
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
}
