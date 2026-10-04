import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { getPermit } from "@/lib/mock/store";
import { getPermitPdfObject } from "@/lib/storage/s3";

type Params = { params: Promise<{ id: string }> };

/**
 * Streams the permit PDF from S3/LocalStack through this same-origin route.
 * The browser (react-pdf) must load this URL, not the raw S3 URL, or the
 * canvas often renders blank due to cross-origin / range-request issues.
 *
 * Metadata still stores `fileUrl` + `storageKey` on the permit record.
 * Pass `?meta=1` to get JSON instead of PDF bytes.
 */
export async function GET(request: Request, { params }: Params) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const permit = getPermit(email, id);
  if (!permit?.storageKey) {
    return NextResponse.json({ error: "Permit file not found." }, { status: 404 });
  }

  const wantMeta = new URL(request.url).searchParams.get("meta") === "1";
  if (wantMeta) {
    return NextResponse.json({
      url: `/api/permits/${encodeURIComponent(id)}/file`,
      storageKey: permit.storageKey,
      fileUrl: permit.fileUrl,
      fileName: permit.fileName,
      mimeType: permit.mimeType,
    });
  }

  try {
    const object = await getPermitPdfObject(permit.storageKey);
    const safeName = permit.fileName.replace(/"/g, "");
    return new NextResponse(new Uint8Array(object.bytes), {
      status: 200,
      headers: {
        "Content-Type": permit.mimeType || object.contentType || "application/pdf",
        "Content-Length": String(object.bytes.length),
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not read object from storage.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
