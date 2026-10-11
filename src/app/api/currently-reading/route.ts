import { isAuthenticated } from "@/lib/auth";
import { getCurrentlyReading, setCurrentlyReading } from "@/lib/reviews";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(await getCurrentlyReading());
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    author?: string;
    progress?: number;
    note?: string;
    coverId?: number | null;
  };

  const title = body.title?.trim() ?? "";
  const author = body.author?.trim() ?? "";
  const note = body.note?.trim() ?? "";
  const progress = Number(body.progress);
  const coverId = Number(body.coverId);

  if (!title || !author) {
    return NextResponse.json(
      { error: "Title and author are required." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return NextResponse.json(
      { error: "Progress must be between 0 and 100." },
      { status: 400 },
    );
  }

  const updated = await setCurrentlyReading({
    title,
    author,
    progress: Math.round(progress),
    note,
    coverId: Number.isInteger(coverId) && coverId > 0 ? coverId : null,
  });

  return NextResponse.json(updated);
}
