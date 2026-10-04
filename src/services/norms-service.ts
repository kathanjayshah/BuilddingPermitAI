import { apiJson } from "@/services/http";
import type { NormRecord, NormSource } from "@/lib/types";

export const normsService = {
  list: () => apiJson<{ norms: NormRecord[] }>("/api/norms"),

  create: (body: {
    title: string;
    content?: string;
    source: NormSource;
    sourceUrl?: string;
  }) =>
    apiJson<{ norm: NormRecord }>("/api/norms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name);
    return apiJson<{ norm: NormRecord }>("/api/norms", {
      method: "POST",
      body: form,
    });
  },
};
