import type {
  NormRecord,
  PermitRecord,
  PdfHighlight,
  ReviewRun,
} from "@/lib/types";

type MemoryStore = {
  permits: PermitRecord[];
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
      norms: [],
      reviews: [],
      highlights: [],
    };
  }
  return globalForStore.__bpaStore;
}

export function listPermits(email: string): PermitRecord[] {
  return getStore()
    .permits.filter((p) => p.email === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addPermit(permit: PermitRecord): PermitRecord {
  getStore().permits.push(permit);
  return permit;
}

export function getPermit(email: string, id: string): PermitRecord | undefined {
  return getStore().permits.find((p) => p.email === email && p.id === id);
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
  permitId: string,
): PdfHighlight[] {
  return getStore()
    .highlights.filter((h) => h.email === email && h.permitId === permitId)
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
