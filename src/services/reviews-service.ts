import { apiJson } from "@/services/http";
import type { ReviewRun } from "@/lib/types";

export const reviewsService = {
  list: () => apiJson<{ reviews: ReviewRun[] }>("/api/reviews"),

  create: (body: { permitId: string; normIds: string[] }) =>
    apiJson<{ review: ReviewRun }>("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};
