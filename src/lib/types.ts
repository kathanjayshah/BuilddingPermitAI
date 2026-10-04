export type DocumentKind = "pdf" | "image";

export type PermitType =
  | "residential"
  | "commercial"
  | "industrial"
  | "renovation"
  | "demolition"
  | "electrical"
  | "plumbing"
  | "mechanical"
  | "occupancy"
  | "zoning"
  | "other";

/** Uploaded file attached to a permit (PDF or image). */
export type DocumentRecord = {
  id: string;
  permitId: string;
  email: string;
  kind: DocumentKind;
  fileName: string;
  fileSize: number;
  mimeType: string;
  /** Object key in S3/LocalStack. */
  storageKey: string;
  /** Public or browser-reachable object URL. */
  fileUrl: string;
  createdAt: string;
};

/** Permit case. Documents hold the uploaded files. */
export type PermitRecord = {
  id: string;
  email: string;
  title: string;
  type: PermitType;
  createdAt: string;
  documents: DocumentRecord[];
};

export type NormSource = "upload" | "paste" | "web_stub";

export type NormRecord = {
  id: string;
  email: string;
  title: string;
  source: NormSource;
  /** Pasted text or extracted stub text from an upload. */
  content: string;
  fileName?: string;
  /** Stub URL for future municipal web-fetch. */
  sourceUrl?: string;
  createdAt: string;
};

export type ReviewStatus = "queued" | "stubbed";

export type ReviewRun = {
  id: string;
  email: string;
  permitId: string;
  normIds: string[];
  status: ReviewStatus;
  note: string;
  createdAt: string;
};

/** Highlight rects use percentages of the rendered page (0-100). */
export type PdfHighlight = {
  id: string;
  email: string;
  documentId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  note: string;
  color: string;
  createdAt: string;
};
