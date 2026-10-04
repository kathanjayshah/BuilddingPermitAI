"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { sessionService } from "@/services/session-service";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: () => sessionService.get(),
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => sessionService.signIn(email),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      await queryClient.invalidateQueries({ queryKey: queryKeys.permits });
      await queryClient.invalidateQueries({ queryKey: queryKeys.norms });
      await queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => sessionService.signOut(),
    onSuccess: async () => {
      queryClient.clear();
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
}
