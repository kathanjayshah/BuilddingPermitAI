import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidEmail, SESSION_COOKIE } from "@/lib/session";

export async function GET() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ email: null });
  }
  const email = decodeURIComponent(raw);
  return NextResponse.json({ email });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const jar = await cookies();
  // Store the raw email. Next.js cookie serialization encodes once already;
  // encodeURIComponent here would double-encode "@" to "%2540".
  jar.set(SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ email });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
