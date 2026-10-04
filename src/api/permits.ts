import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { addPermit, createId, listPermits } from "@/lib/mock/store";
import { uploadPermitPdf } from "@/lib/storage/s3";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ permits: listPermits(email) });
}

export async function POST(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Upload a PDF file under the file field." },
      { status: 400 },
    );
  }

  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json(
      { error: "Only PDF files are accepted." },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  const id = createId("permit");
  const mimeType = file.type || "application/pdf";
  const bytes = Buffer.from(await file.arrayBuffer());
  const storageKey = `permits/${email}/${id}/${file.name}`;

  try {
    const uploaded = await uploadPermitPdf({
      storageKey,
      bytes,
      contentType: mimeType,
      fileName: file.name,
    });

    const permit = addPermit({
      id,
      email,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      storageKey: uploaded.storageKey,
      fileUrl: uploaded.fileUrl,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ permit }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload to object storage.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
