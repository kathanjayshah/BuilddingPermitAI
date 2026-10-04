import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import {
  addDocument,
  addPermit,
  createId,
  getPermit,
  listPermits,
} from "@/lib/mock/store";
import { detectDocumentKind, titleFromFileName } from "@/lib/documents";
import { isPermitType } from "@/lib/permit-types";
import { uploadDocumentObject } from "@/lib/storage/s3";
import type { PermitType } from "@/lib/types";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ permits: listPermits(email) });
}

/**
 * Create a permit case and attach the uploaded file as its first document.
 */
export async function POST(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const titleInput = form.get("title");
  const typeInput = form.get("type");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Upload a PDF or image under the file field." },
      { status: 400 },
    );
  }

  const kind = detectDocumentKind(file);
  if (!kind) {
    return NextResponse.json(
      { error: "Only PDF or image files are accepted." },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  const title =
    typeof titleInput === "string" ? titleInput.trim() : "";
  if (!title) {
    return NextResponse.json(
      { error: "Permit title is required." },
      { status: 400 },
    );
  }

  const typeRaw = typeof typeInput === "string" ? typeInput.trim() : "other";
  if (!isPermitType(typeRaw)) {
    return NextResponse.json(
      { error: "Invalid permit type." },
      { status: 400 },
    );
  }
  const type: PermitType = typeRaw;

  const permitId = createId("permit");
  const documentId = createId("doc");
  const mimeType =
    file.type || (kind === "pdf" ? "application/pdf" : "application/octet-stream");
  const bytes = Buffer.from(await file.arrayBuffer());
  const storageKey = `permits/${email}/${permitId}/${documentId}/${file.name}`;

  try {
    const uploaded = await uploadDocumentObject({
      storageKey,
      bytes,
      contentType: mimeType,
      fileName: file.name,
    });

    const permit = addPermit({
      id: permitId,
      email,
      title: title || titleFromFileName(file.name),
      type,
      createdAt: new Date().toISOString(),
    });

    addDocument({
      id: documentId,
      permitId,
      email,
      kind,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      storageKey: uploaded.storageKey,
      fileUrl: uploaded.fileUrl,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { permit: getPermit(email, permit.id) ?? permit },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not upload to object storage.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
