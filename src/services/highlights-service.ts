import { apiJson } from "@/services/http";
import type { PdfHighlight } from "@/lib/types";

export const highlightsService = {
  list: (permitId: string) =>
    apiJson<{ highlights: PdfHighlight[] }>(
      `/api/highlights?permitId=${encodeURIComponent(permitId)}`,
    ),

  create: (body: {
    permitId: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    note?: string;
    color?: string;
  }) =>
    apiJson<{ highlight: PdfHighlight }>("/api/highlights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  remove: (id: string) =>
    apiJson<{ ok: boolean }>(
      `/api/highlights?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    ),
};
