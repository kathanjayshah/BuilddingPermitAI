"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { reviewsService } from "@/services/reviews-service";

export function useReviews(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.reviews,
    enabled,
    queryFn: () => reviewsService.list(),
    select: (data) => data.reviews,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { permitId: string; normIds: string[] }) =>
      reviewsService.create(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
    },
  });
}
