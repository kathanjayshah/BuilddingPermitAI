import { apiJson } from "@/services/http";
import type { DocumentRecord, PermitRecord, PermitType } from "@/lib/types";

export type DocumentFileResponse = {
  url: string;
  storageKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  kind: string;
  permitId: string;
};

export const permitsService = {
  list: () => apiJson<{ permits: PermitRecord[] }>("/api/permits"),

  /** Create a permit and attach the first document (PDF or image). */
  upload: async (file: File, title: string, type: PermitType) => {
    const form = new FormData();
    form.append("file", file);
    form.append("title", title.trim());
    form.append("type", type);
    return apiJson<{ permit: PermitRecord }>("/api/permits", {
      method: "POST",
      body: form,
    });
  },

  listDocuments: (permitId: string) =>
    apiJson<{ documents: DocumentRecord[] }>(
      `/api/permits/${encodeURIComponent(permitId)}/documents`,
    ),

  addDocument: async (permitId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiJson<{ document: DocumentRecord }>(
      `/api/permits/${encodeURIComponent(permitId)}/documents`,
      { method: "POST", body: form },
    );
  },
};

export const documentsService = {
  filePath: (documentId: string) =>
    `/api/documents/${encodeURIComponent(documentId)}/file`,

  getFile: (documentId: string) =>
    apiJson<DocumentFileResponse>(
      `${documentsService.filePath(documentId)}?meta=1`,
    ),
};
