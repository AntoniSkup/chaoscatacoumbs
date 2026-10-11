import { isAuthenticated } from "@/lib/auth";
import { toggleFavorite } from "@/lib/reviews";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/reviews/[id]/favorite">,
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const review = await toggleFavorite(id);

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  return NextResponse.json(review);
}
