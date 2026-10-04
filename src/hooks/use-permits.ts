"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { documentsService, permitsService } from "@/services/permits-service";
import type { PermitType } from "@/lib/types";

export function usePermits(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.permits,
    enabled,
    queryFn: () => permitsService.list(),
    select: (data) => data.permits,
  });
}

export function useUploadPermit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      title,
      type,
    }: {
      file: File;
      title: string;
      type: PermitType;
    }) => permitsService.upload(file, title, type),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.permits });
    },
  });
}

export function useAddPermitDocument(permitId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      if (!permitId) throw new Error("permitId is required");
      return permitsService.addDocument(permitId, file);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.permits });
    },
  });
}

/** Same-origin proxy URL for react-pdf. */
export function useDocumentFileUrl(
  documentId: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.documentFile(documentId ?? "none"),
    enabled: enabled && Boolean(documentId),
    queryFn: async () => {
      const meta = await documentsService.getFile(documentId!);
      return meta.url || documentsService.filePath(documentId!);
    },
    staleTime: 60_000,
  });
}
