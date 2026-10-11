import Link from "next/link";
import { Suspense } from "react";
import { AboutSection } from "@/components/AboutSection";
import { Banner } from "@/components/Banner";
import { CategoryList } from "@/components/CategoryList";
import { CurrentlyReading } from "@/components/CurrentlyReading";
import { FavoritesShelf } from "@/components/FavoritesShelf";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QuoteCard } from "@/components/QuoteCard";
import { ReviewCard } from "@/components/ReviewCard";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeading } from "@/components/SectionHeading";
import { isAuthenticated } from "@/lib/auth";
import {
  getCategoryCounts,
  getCurrentlyReading,
  getFavorites,
  getReviews,
} from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [authenticated, reviews, categories, favorites, currentlyReading] =
    await Promise.all([
      isAuthenticated(),
      getReviews(),
      getCategoryCounts(),
      getFavorites(),
      getCurrentlyReading(),
    ]);

  const latest = reviews.slice(0, 4);

  return (
    <>
      <Header authenticated={authenticated} />
      <Banner />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-14 px-4 py-12 sm:space-y-20 sm:px-6">
        <section aria-label="Search reviews" className="mx-auto w-full max-w-md">
          <Suspense fallback={<div className="h-11" />}>
            <SearchBar placeholder="Search by title or author..." />
          </Suspense>
        </section>

        <section id="reviews" aria-labelledby="latest-reviews">
          <SectionHeading
            id="latest-reviews"
            title="Latest Reviews"
            action={{ href: "/reviews", label: "View all" }}
          />

          {latest.length === 0 ? (
            <div className="border border-line px-6 py-16 text-center">
              <p className="font-script text-3xl text-rose">no reviews yet</p>
              <p className="mt-3 text-sm text-ink-muted">
                {authenticated
                  ? "Publish the first one from the Publish page."
                  : "Log in to publish the first one."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canEdit={authenticated}
                />
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <CurrentlyReading data={currentlyReading} canEdit={authenticated} />
          <FavoritesShelf favorites={favorites} />
        </div>

        <QuoteCard text="just one more chapter..." />

        <section aria-labelledby="browse-categories">
          <SectionHeading id="browse-categories" title="Categories" />
          <CategoryList categories={categories} variant="grid" />
        </section>

        <AboutSection
          leftPanel={{
            src: "/about-left.png",
            alt: "Candlelit bedroom at dusk overlooking a city skyline, with a framed sign reading “Same Sky Different Beds”",
          }}
          rightPanel={{
            src: "/about-right.png",
            alt: "Candlelit flat lay of dark romance books, a deep red rose and strands of pearls, hand-lettered “same girl... new books, bigger dreams”",
          }}
        />

        <section className="border-t border-line pt-12 text-center">
          <p className="font-script text-3xl text-rose">
            {authenticated ? "got thoughts to share?" : "want to read along?"}
          </p>
          <Link
            href={authenticated ? "/reviews/new" : "/login"}
            className="mt-5 inline-block border border-rose bg-rose/15 px-6 py-3 font-serif text-[12px] tracking-[0.2em] text-rose-soft uppercase transition-colors hover:bg-rose/25"
          >
            {authenticated ? "Publish a review" : "Login to publish"} →
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
