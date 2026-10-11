import { isAuthenticated } from "@/lib/auth";
import { deleteReview, getReview } from "@/lib/reviews";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/reviews/[id]">,
) {
  const { id } = await params;
  const review = await getReview(id);

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  return NextResponse.json(review);
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/reviews/[id]">,
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const removed = await deleteReview(id);

  if (!removed) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  return NextResponse.json({ id });
}
