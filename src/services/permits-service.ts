import { apiJson } from "@/services/http";
import type { PermitRecord } from "@/lib/types";

export type PermitFileResponse = {
  /** Same-origin URL the PDF viewer should load. */
  url: string;
  storageKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
};

export const permitsService = {
  list: () => apiJson<{ permits: PermitRecord[] }>("/api/permits"),

  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiJson<{ permit: PermitRecord }>("/api/permits", {
      method: "POST",
      body: form,
    });
  },

  /** Same-origin proxy path for react-pdf (not the raw S3 URL). */
  filePath: (permitId: string) =>
    `/api/permits/${encodeURIComponent(permitId)}/file`,

  /** Metadata about the stored object + proxy URL. */
  getFile: (permitId: string) =>
    apiJson<PermitFileResponse>(
      `${permitsService.filePath(permitId)}?meta=1`,
    ),
};
