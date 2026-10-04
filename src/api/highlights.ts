import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import {
  addHighlight,
  createId,
  deleteHighlight,
  getDocument,
  listHighlights,
} from "@/lib/mock/store";

export async function GET(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documentId = new URL(request.url).searchParams
    .get("documentId")
    ?.trim();
  if (!documentId) {
    return NextResponse.json(
      { error: "documentId query param is required." },
      { status: 400 },
    );
  }

  if (!getDocument(email, documentId)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  return NextResponse.json({
    highlights: listHighlights(email, documentId),
  });
}

export async function POST(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    documentId?: string;
    page?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    note?: string;
    color?: string;
  } | null;

  const documentId = body?.documentId?.trim() ?? "";
  if (!documentId || !getDocument(email, documentId)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const page = Number(body?.page);
  const x = Number(body?.x);
  const y = Number(body?.y);
  const width = Number(body?.width);
  const height = Number(body?.height);

  if (
    !Number.isFinite(page) ||
    page < 1 ||
    ![x, y, width, height].every((n) => Number.isFinite(n)) ||
    width <= 0 ||
    height <= 0
  ) {
    return NextResponse.json(
      { error: "Valid page and highlight rect are required." },
      { status: 400 },
    );
  }

  const highlight = addHighlight({
    id: createId("hl"),
    email,
    documentId,
    page: Math.floor(page),
    x,
    y,
    width,
    height,
    note: body?.note?.trim() || "Highlight",
    color: body?.color?.trim() || "#facc15",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ highlight }, { status: 201 });
}

export async function DELETE(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json(
      { error: "id query param is required." },
      { status: 400 },
    );
  }

  const ok = deleteHighlight(email, id);
  if (!ok) {
    return NextResponse.json(
      { error: "Highlight not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
