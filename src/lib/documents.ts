import type { DocumentKind } from "@/lib/types";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i;

export function detectDocumentKind(file: File): DocumentKind | null {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/") || IMAGE_EXT.test(name)) return "image";
  return null;
}

export function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "") || fileName;
}
