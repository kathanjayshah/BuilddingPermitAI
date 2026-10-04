import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { getPermit } from "@/lib/mock/store";

type Params = { params: Promise<{ id: string }> };

/**
 * Compatibility helper: redirect meta clients to the first PDF document
 * on the permit. Prefer `/api/documents/:id/file`.
 */
export async function GET(request: Request, { params }: Params) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: permitId } = await params;
  const permit = getPermit(email, permitId);
  if (!permit) {
    return NextResponse.json({ error: "Permit not found." }, { status: 404 });
  }

  const document =
    permit.documents.find((d) => d.kind === "pdf") ?? permit.documents[0];
  if (!document) {
    return NextResponse.json(
      { error: "No documents on this permit." },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const target = `/api/documents/${encodeURIComponent(document.id)}/file${url.search}`;
  return NextResponse.redirect(new URL(target, url.origin));
}
