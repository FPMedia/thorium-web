import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/admin";

const SESSION_MAX_AGE_SECONDS = 60 * 60;

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function POST(request: NextRequest) {
  let token: unknown;

  try {
    const body = await request.json();
    token = body?.token;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    await verifyIdToken(token);
  } catch (error) {
    console.error("Rejected session cookie: invalid ID token", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("__session", token, sessionCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("__session", "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
