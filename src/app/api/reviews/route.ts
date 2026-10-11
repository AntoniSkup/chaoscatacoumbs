import { isAuthenticated } from "@/lib/auth";
import { CATEGORIES } from "@/lib/categories";
import { addReview, getReviews } from "@/lib/reviews";
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

  const body = (await request.json()) as {
    title?: string;
    author?: string;
    categories?: string[];
    text?: string;
    rating?: number;
    coverId?: number | null;
  };

  const title = body.title?.trim() ?? "";
  const author = body.author?.trim() ?? "";
  const text = body.text?.trim() ?? "";
  const rating = Number(body.rating);
  const coverId = Number(body.coverId);
  const categories = (body.categories ?? []).filter((category) =>
    (CATEGORIES as readonly string[]).includes(category),
  );

  if (!title || !author || !text) {
    return NextResponse.json(
      { error: "Title, author and review text are required." },
      { status: 400 },
    );
  }

  if (categories.length === 0) {
    return NextResponse.json(
      { error: "Pick at least one valid category." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 6) {
    return NextResponse.json(
      { error: "Rating must be an integer from 1 to 6." },
      { status: 400 },
    );
  }

  const review = await addReview({
    title,
    author,
    text,
    categories,
    rating,
    favorite: false,
    coverId: Number.isInteger(coverId) && coverId > 0 ? coverId : null,
  });

  return NextResponse.json(review, { status: 201 });
}
