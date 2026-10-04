"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { normsService } from "@/services/norms-service";
import type { NormSource } from "@/lib/types";

export function useNorms(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.norms,
    enabled,
    queryFn: () => normsService.list(),
    select: (data) => data.norms,
  });
}

export function useCreateNorm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      content?: string;
      source: NormSource;
      sourceUrl?: string;
    }) => normsService.create(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.norms });
    },
  });
}

export function useUploadNorm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => normsService.upload(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.norms });
    },
  });
}
