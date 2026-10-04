"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { permitsService } from "@/services/permits-service";

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
    mutationFn: (file: File) => permitsService.upload(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.permits });
    },
  });
}

/** Same-origin proxy URL for react-pdf (avoids blank canvas from cross-origin S3). */
export function usePermitFileUrl(permitId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.permitFile(permitId ?? "none"),
    enabled: enabled && Boolean(permitId),
    queryFn: async () => {
      const meta = await permitsService.getFile(permitId!);
      return meta.url || permitsService.filePath(permitId!);
    },
    staleTime: 60_000,
  });
}
