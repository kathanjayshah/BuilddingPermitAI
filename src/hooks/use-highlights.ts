"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { highlightsService } from "@/services/highlights-service";

export function useHighlights(permitId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.highlights(permitId ?? "none"),
    enabled: enabled && Boolean(permitId),
    queryFn: () => highlightsService.list(permitId!),
    select: (data) => data.highlights,
  });
}

export function useCreateHighlight(permitId: string | null) {
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
      if (!permitId) throw new Error("permitId is required");
      return highlightsService.create({ ...body, permitId });
    },
    onSuccess: async () => {
      if (!permitId) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.highlights(permitId),
      });
    },
  });
}

export function useDeleteHighlight(permitId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => highlightsService.remove(id),
    onSuccess: async () => {
      if (!permitId) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.highlights(permitId),
      });
    },
  });
}
