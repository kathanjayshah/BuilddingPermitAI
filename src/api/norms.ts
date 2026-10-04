import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { addNorm, createId, listNorms } from "@/lib/mock/store";
import type { NormSource } from "@/lib/types";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ norms: listNorms(email) });
}

export async function POST(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return handleUpload(email, await request.formData());
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    content?: string;
    source?: NormSource;
    sourceUrl?: string;
  } | null;

  const title = body?.title?.trim() ?? "";
  const content = body?.content?.trim() ?? "";
  const source = body?.source ?? "paste";

  if (source === "web_stub") {
    const sourceUrl = body?.sourceUrl?.trim() ?? "";
    if (!title || !sourceUrl) {
      return NextResponse.json(
        { error: "Web-fetch stub needs a title and sourceUrl." },
        { status: 400 },
      );
    }
    const norm = addNorm({
      id: createId("norm"),
      email,
      title,
      source: "web_stub",
      content:
        content ||
        `[web_fetch_stub] Future crawl of ${sourceUrl}. No content fetched yet.`,
      sourceUrl,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ norm }, { status: 201 });
  }

  if (!title || !content) {
    return NextResponse.json(
      { error: "Paste mode needs a title and content." },
      { status: 400 },
    );
  }

  const norm = addNorm({
    id: createId("norm"),
    email,
    title,
    source: "paste",
    content,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ norm }, { status: 201 });
}

async function handleUpload(email: string, form: FormData) {
  const file = form.get("file");
  const titleInput = String(form.get("title") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Upload a file under the file field." },
      { status: 400 },
    );
  }

  const text = await file.text();
  const title = titleInput || file.name;

  const norm = addNorm({
    id: createId("norm"),
    email,
    title,
    source: "upload",
    content:
      text.slice(0, 50_000) || `[upload] ${file.name} (${file.size} bytes)`,
    fileName: file.name,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ norm }, { status: 201 });
}
