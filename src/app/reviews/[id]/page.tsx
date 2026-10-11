import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/BookCover";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ReviewMenu } from "@/components/ReviewMenu";
import { StarRating } from "@/components/StarRating";
import { isAuthenticated } from "@/lib/auth";
import { getReview } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: PageProps<"/reviews/[id]">) {
  const { id } = await params;
  const [authenticated, review] = await Promise.all([
    isAuthenticated(),
    getReview(id),
  ]);

  if (!review) {
    notFound();
  }

  return (
    <>
      <Header authenticated={authenticated} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <Link
          href="/reviews"
          className="font-serif text-[12px] tracking-[0.18em] text-ink-muted uppercase hover:text-rose"
        >
          ← Back to all reviews
        </Link>

        <article className="mt-6 border border-line bg-bg-elevated/40 p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[200px_1fr]">
            <div>
              <BookCover
                title={review.title}
                author={review.author}
                coverId={review.coverId}
                size="lg"
              />
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl tracking-[0.1em] text-ink">
                    {review.title}
                  </h1>
                  <p className="mt-1 text-sm text-ink-muted">
                    by {review.author}
                  </p>
                </div>
                {authenticated ? (
                  <div className="flex items-center gap-1">
                    <FavoriteButton review={review} size="lg" />
                    <ReviewMenu reviewId={review.id} redirectTo="/reviews" />
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <StarRating value={review.rating} size="lg" />
                <span className="text-sm text-ink-muted">
                  {review.rating}/6
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {review.categories.map((category) => (
                  <Link
                    key={category}
                    href={`/reviews?category=${encodeURIComponent(category)}`}
                    className="border border-line px-3 py-1 font-serif text-[11px] tracking-[0.16em] text-rose uppercase transition-colors hover:bg-rose/10"
                  >
                    {category}
                  </Link>
                ))}
              </div>

              <p className="mt-6 text-lg leading-relaxed whitespace-pre-line text-ink/90">
                {review.text}
              </p>

              <p className="mt-8 font-serif text-[12px] tracking-[0.16em] text-ink-muted uppercase">
                Published{" "}
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
