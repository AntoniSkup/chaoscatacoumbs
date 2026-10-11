import { DEMO_PASSWORD, DEMO_USER, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const username = body.username?.trim().toLowerCase();
  const password = body.password ?? "";

  if (username !== DEMO_USER || password !== DEMO_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid credentials. Try chaos / catacombs." },
      { status: 401 },
    );
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
