export const queryKeys = {
  session: ["session"] as const,
  permits: ["permits"] as const,
  norms: ["norms"] as const,
  reviews: ["reviews"] as const,
  highlights: (documentId: string) => ["highlights", documentId] as const,
  documentFile: (documentId: string) => ["document-file", documentId] as const,
};
