import type {
  DocumentRecord,
  NormRecord,
  PermitRecord,
  PdfHighlight,
  ReviewRun,
} from "@/lib/types";

type MemoryStore = {
  permits: PermitRecord[];
  documents: DocumentRecord[];
  norms: NormRecord[];
  reviews: ReviewRun[];
  highlights: PdfHighlight[];
};

const globalForStore = globalThis as typeof globalThis & {
  __bpaStore?: MemoryStore;
};

function getStore(): MemoryStore {
  if (!globalForStore.__bpaStore) {
    globalForStore.__bpaStore = {
      permits: [],
      documents: [],
      norms: [],
      reviews: [],
      highlights: [],
    };
  }
  return globalForStore.__bpaStore;
}

function withDocuments(permit: PermitRecord): PermitRecord {
  const documents = getStore()
    .documents.filter((d) => d.permitId === permit.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { ...permit, documents };
}

export function listPermits(email: string): PermitRecord[] {
  return getStore()
    .permits.filter((p) => p.email === email)
    .map(withDocuments)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addPermit(
  permit: Omit<PermitRecord, "documents">,
): PermitRecord {
  const row: PermitRecord = { ...permit, documents: [] };
  getStore().permits.push(row);
  return withDocuments(row);
}

export function getPermit(email: string, id: string): PermitRecord | undefined {
  const permit = getStore().permits.find((p) => p.email === email && p.id === id);
  return permit ? withDocuments(permit) : undefined;
}

export function addDocument(document: DocumentRecord): DocumentRecord {
  getStore().documents.push(document);
  return document;
}

export function listDocuments(
  email: string,
  permitId: string,
): DocumentRecord[] {
  return getStore()
    .documents.filter((d) => d.email === email && d.permitId === permitId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getDocument(
  email: string,
  id: string,
): DocumentRecord | undefined {
  return getStore().documents.find((d) => d.email === email && d.id === id);
}

export function listNorms(email: string): NormRecord[] {
  return getStore()
    .norms.filter((n) => n.email === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addNorm(norm: NormRecord): NormRecord {
  getStore().norms.push(norm);
  return norm;
}

export function getNormsByIds(email: string, ids: string[]): NormRecord[] {
  const idSet = new Set(ids);
  return getStore().norms.filter((n) => n.email === email && idSet.has(n.id));
}

export function listReviews(email: string): ReviewRun[] {
  return getStore()
    .reviews.filter((r) => r.email === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addReview(review: ReviewRun): ReviewRun {
  getStore().reviews.push(review);
  return review;
}

export function listHighlights(
  email: string,
  documentId: string,
): PdfHighlight[] {
  return getStore()
    .highlights.filter((h) => h.email === email && h.documentId === documentId)
    .sort((a, b) => a.page - b.page || a.createdAt.localeCompare(b.createdAt));
}

export function addHighlight(highlight: PdfHighlight): PdfHighlight {
  getStore().highlights.push(highlight);
  return highlight;
}

export function deleteHighlight(email: string, id: string): boolean {
  const store = getStore();
  const index = store.highlights.findIndex(
    (h) => h.email === email && h.id === id,
  );
  if (index === -1) return false;
  store.highlights.splice(index, 1);
  return true;
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
