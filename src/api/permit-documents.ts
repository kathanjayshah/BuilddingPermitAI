import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import {
  addDocument,
  createId,
  getPermit,
  listDocuments,
} from "@/lib/mock/store";
import { detectDocumentKind } from "@/lib/documents";
import { uploadDocumentObject } from "@/lib/storage/s3";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: permitId } = await params;
  if (!getPermit(email, permitId)) {
    return NextResponse.json({ error: "Permit not found." }, { status: 404 });
  }

  return NextResponse.json({
    documents: listDocuments(email, permitId),
  });
}

/** Add another document to an existing permit. */
export async function POST(request: Request, { params }: Params) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: permitId } = await params;
  if (!getPermit(email, permitId)) {
    return NextResponse.json({ error: "Permit not found." }, { status: 404 });
  }

  const form = await request.formData();
  const file = form.get("file");

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

    const document = addDocument({
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

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not upload to object storage.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
