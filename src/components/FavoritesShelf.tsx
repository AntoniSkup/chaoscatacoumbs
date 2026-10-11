import Link from "next/link";
import type { Review } from "@/lib/reviews";
import { BookCover } from "./BookCover";

export function FavoritesShelf({ favorites }: { favorites: Review[] }) {
  return (
    <section id="favorites" className="border border-line bg-bg-elevated/40 p-5">
      <h2 className="border-b border-line pb-3 font-serif text-xs tracking-[0.24em] text-ink uppercase">
        My Favorites
      </h2>

      {favorites.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">
          No favorites marked yet. Log in and tap the heart on any review.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {favorites.slice(0, 4).map((review) => (
            <Link key={review.id} href={`/reviews/${review.id}`}>
              <BookCover
                title={review.title}
                author={review.author}
                coverId={review.coverId}
                size="sm"
              />
            </Link>
          ))}
        </div>
      )}

      <p className="mt-4 font-script text-lg text-rose">
        some of my all time favorites ♡
      </p>
    </section>
  );
}
