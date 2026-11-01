import { login } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const result = await login(body.username ?? "", body.password ?? "");

  if (result === "unconfigured") {
    return NextResponse.json(
      { error: "Sign-in is not configured." },
      { status: 503 },
    );
  }

  if (result === "invalid") {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
