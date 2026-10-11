import Link from "next/link";
import { Suspense } from "react";
import { CategoryList } from "@/components/CategoryList";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ReviewCard } from "@/components/ReviewCard";
import { SearchBar } from "@/components/SearchBar";
import { isAuthenticated } from "@/lib/auth";
import { getCategoryCounts, getReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReviewsPage({
  searchParams,
}: PageProps<"/reviews">) {
  const params = await searchParams;
  const query = first(params.q);
  const category = first(params.category);

  const [authenticated, reviews, categories] = await Promise.all([
    isAuthenticated(),
    getReviews({ query, category }),
    getCategoryCounts(),
  ]);

  return (
    <>
      <Header authenticated={authenticated} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-col gap-2 border-b border-line pb-5">
          <p className="font-script text-2xl text-rose">all reviews</p>
          <h1 className="font-serif text-2xl tracking-[0.24em] text-ink uppercase md:text-3xl">
            The Catacombs
          </h1>
          <p className="text-sm text-ink-muted">
            {reviews.length} review{reviews.length === 1 ? "" : "s"} · rated out
            of 6 stars
            {query ? ` · searching “${query}”` : ""}
            {category ? ` · ${category}` : ""}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            {reviews.length === 0 ? (
              <div className="border border-line px-6 py-16 text-center">
                <p className="font-script text-3xl text-rose">nothing here</p>
                <p className="mt-3 text-sm text-ink-muted">
                  No reviews match that search.
                </p>
                <Link
                  href="/reviews"
                  className="mt-5 inline-block border border-line-strong px-4 py-2 font-serif text-[12px] tracking-[0.18em] text-rose uppercase hover:bg-rose/10"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    canEdit={authenticated}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div>
              <h2 className="border-b border-line pb-2 font-serif text-xs tracking-[0.24em] text-ink uppercase">
                Search
              </h2>
              <div className="mt-3">
                <Suspense fallback={<div className="h-11" />}>
                  <SearchBar />
                </Suspense>
              </div>
            </div>

            <CategoryList categories={categories} activeCategory={category} />
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
