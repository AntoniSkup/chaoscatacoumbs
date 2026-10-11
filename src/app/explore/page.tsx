import Link from "next/link";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NewBookCard } from "@/components/NewBookCard";
import { SearchBar } from "@/components/SearchBar";
import { isAuthenticated } from "@/lib/auth";
import type { ShelfSlug } from "@/lib/books";
import {
  getNewBooks,
  resolveShelf,
  searchBookVolumes,
  SHELVES,
} from "@/lib/books";

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function BookGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="h-96 animate-pulse border border-line bg-bg-elevated/40"
        />
      ))}
    </div>
  );
}

function EmptyState({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line px-6 py-16 text-center">
      <p className="font-script text-3xl text-rose">{heading}</p>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">{children}</p>
    </div>
  );
}

async function BookGrid({ shelf, query }: { shelf: ShelfSlug; query?: string }) {
  const result = query
    ? await searchBookVolumes(query)
    : await getNewBooks(shelf);

  if (result.status === "quota") {
    return (
      <EmptyState heading="out of quota">
        Google Books is rate-limiting anonymous requests. Add a free{" "}
        <code className="text-rose">GOOGLE_BOOKS_API_KEY</code> to{" "}
        <code className="text-rose">.env</code> and restart the dev server to
        get your own quota.
      </EmptyState>
    );
  }

  if (result.status === "error") {
    return (
      <EmptyState heading="shelf unavailable">
        Google Books answered with a server error on every retry — that is on
        their side, not your key. Reload in a minute.
      </EmptyState>
    );
  }

  if (result.books.length === 0) {
    return query ? (
      <EmptyState heading="no matches">
        Google Books has nothing for “{query}”. Try a different title or
        author.
      </EmptyState>
    ) : (
      <EmptyState heading="nothing new">
        No recent releases came back for this shelf. Try another one.
      </EmptyState>
    );
  }

  return (
    <>
      {result.stale ? (
        <p className="mb-4 border border-line bg-bg-elevated/60 px-4 py-3 text-xs text-ink-muted">
          Google Books is flaky right now — showing the last books that came
          back for this shelf.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {result.books.map((book) => (
          <NewBookCard key={book.id} book={book} />
        ))}
      </div>
    </>
  );
}

export default async function ExplorePage({
  searchParams,
}: PageProps<"/explore">) {
  const params = await searchParams;
  const shelf = resolveShelf(first(params.shelf));
  const query = first(params.q)?.trim() || undefined;
  const authenticated = await isAuthenticated();

  return (
    <>
      <Header authenticated={authenticated} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <div className="mb-6 flex flex-col gap-2 border-b border-line pb-5">
          <p className="font-script text-2xl text-rose">
            {query ? "search results" : "fresh off the press"}
          </p>
          <h1 className="font-serif text-2xl tracking-[0.24em] text-ink uppercase md:text-3xl">
            {query ? "Explore Books" : "Explore New Books"}
          </h1>
          <p className="text-sm text-ink-muted">
            {query ? (
              <>
                Google Books matches for “{query}”.{" "}
                <Link href="/explore" className="text-rose hover:text-rose-soft">
                  Back to new releases
                </Link>
              </>
            ) : (
              <>
                The newest {shelf.label.toLowerCase()} releases, straight from
                Google Books.
              </>
            )}
          </p>
        </div>

        <div className="mb-6 max-w-md">
          <Suspense fallback={<div className="h-11" />}>
            <SearchBar
              destination="/explore"
              label="Search Google Books"
              placeholder="Search any book by title or author..."
            />
          </Suspense>
        </div>

        <nav className="mb-8 flex flex-wrap gap-2">
          {SHELVES.map((option) => {
            const active = !query && option.slug === shelf.slug;
            return (
              <Link
                key={option.slug}
                href={`/explore?shelf=${option.slug}`}
                className={`border px-4 py-2 font-serif text-[12px] tracking-[0.18em] uppercase transition-colors ${
                  active
                    ? "border-rose bg-rose/15 text-rose-soft"
                    : "border-line text-ink-muted hover:border-line-strong hover:text-rose"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </nav>

        <Suspense key={query ?? shelf.slug} fallback={<BookGridSkeleton />}>
          <BookGrid shelf={shelf.slug} query={query} />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
