import { isAuthenticated } from "@/lib/auth";
import { searchBooks } from "@/lib/openlibrary";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    return NextResponse.json({ results: await searchBooks(query) });
  } catch {
    return NextResponse.json(
      { error: "Open Library is not responding right now." },
      { status: 502 },
    );
  }
}
