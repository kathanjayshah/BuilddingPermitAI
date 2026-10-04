import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import {
  addReview,
  createId,
  getNormsByIds,
  getPermit,
  listReviews,
} from "@/lib/mock/store";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ reviews: listReviews(email) });
}

export async function POST(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    permitId?: string;
    normIds?: string[];
  } | null;

  const permitId = body?.permitId?.trim() ?? "";
  const normIds = Array.isArray(body?.normIds) ? body.normIds : [];

  if (!permitId) {
    return NextResponse.json(
      { error: "permitId is required." },
      { status: 400 },
    );
  }

  if (normIds.length === 0) {
    return NextResponse.json(
      { error: "Select at least one city-norm context item." },
      { status: 400 },
    );
  }

  const permit = getPermit(email, permitId);
  if (!permit) {
    return NextResponse.json({ error: "Permit not found." }, { status: 404 });
  }

  const norms = getNormsByIds(email, normIds);
  if (norms.length !== normIds.length) {
    return NextResponse.json(
      { error: "One or more selected norms were not found." },
      { status: 400 },
    );
  }

  const review = addReview({
    id: createId("review"),
    email,
    permitId,
    normIds,
    status: "stubbed",
    note: "Review run recorded. LLM comparison is not wired yet. Future step: extract PDF text and pack selected norms into the prompt.",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ review }, { status: 201 });
}
