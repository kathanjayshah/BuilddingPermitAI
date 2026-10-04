import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { getDocument } from "@/lib/mock/store";
import { getDocumentObject } from "@/lib/storage/s3";

type Params = { params: Promise<{ id: string }> };

/**
 * Streams a document from S3/LocalStack through this same-origin route.
 * Pass `?meta=1` for JSON metadata instead of bytes.
 */
export async function GET(request: Request, { params }: Params) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = getDocument(email, id);
  if (!document?.storageKey) {
    return NextResponse.json(
      { error: "Document file not found." },
      { status: 404 },
    );
  }

  const wantMeta = new URL(request.url).searchParams.get("meta") === "1";
  if (wantMeta) {
    return NextResponse.json({
      url: `/api/documents/${encodeURIComponent(id)}/file`,
      storageKey: document.storageKey,
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      mimeType: document.mimeType,
      kind: document.kind,
      permitId: document.permitId,
    });
  }

  try {
    const object = await getDocumentObject(document.storageKey);
    const safeName = document.fileName.replace(/"/g, "");
    return new NextResponse(new Uint8Array(object.bytes), {
      status: 200,
      headers: {
        "Content-Type":
          document.mimeType || object.contentType || "application/octet-stream",
        "Content-Length": String(object.bytes.length),
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not read object from storage.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
