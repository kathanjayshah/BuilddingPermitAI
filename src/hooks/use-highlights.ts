"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { highlightsService } from "@/services/highlights-service";

export function useHighlights(documentId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.highlights(documentId ?? "none"),
    enabled: enabled && Boolean(documentId),
    queryFn: () => highlightsService.list(documentId!),
    select: (data) => data.highlights,
  });
}

export function useCreateHighlight(documentId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
      note?: string;
      color?: string;
    }) => {
      if (!documentId) throw new Error("documentId is required");
      return highlightsService.create({ ...body, documentId });
    },
    onSuccess: async () => {
      if (!documentId) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.highlights(documentId),
      });
    },
  });
}

export function useDeleteHighlight(documentId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => highlightsService.remove(id),
    onSuccess: async () => {
      if (!documentId) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.highlights(documentId),
      });
    },
  });
}
