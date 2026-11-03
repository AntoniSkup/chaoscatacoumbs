import { isAuthenticated } from "@/lib/auth";
import { addReview, getReviews, parseReviewDraft } from "@/lib/reviews";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reviews = await getReviews({
    query: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
  });
  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = parseReviewDraft(await request.json());
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const review = await addReview({
    ...parsed.draft,
    favorite: false,
  });

  return NextResponse.json(review, { status: 201 });
}
