"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { BookSuggestion } from "@/lib/openlibrary";
import { BookCover } from "./BookCover";
import { BookSearchField } from "./BookSearchField";
import { StarRatingInput } from "./StarRatingInput";

export function ReviewForm() {
  const router = useRouter();
  const [rating, setRating] = useState(6);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [book, setBook] = useState({
    title: "",
    author: "",
    coverId: null as number | null,
    year: null as number | null,
  });

  function handleSelect(result: BookSuggestion) {
    setBook({
      title: result.title,
      author: result.author,
      coverId: result.coverId,
      year: result.year,
    });
  }

  function toggleCategory(category: string) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selected.length === 0) {
      setError("Pick at least one category.");
      return;
    }

    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: book.title,
        author: book.author,
        coverId: book.coverId,
        text: formData.get("text"),
        categories: selected,
        rating,
      }),
    });

    setPending(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not publish review.");
      return;
    }

    const review = (await response.json()) as { id: string };
    router.refresh();
    router.push(`/reviews/${review.id}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 md:grid-cols-[170px_1fr] md:gap-8"
    >
      <div className="mx-auto w-[170px] space-y-2 md:mx-0">
        <BookCover
          title={book.title || "Your pick"}
          author={book.author || "unknown"}
          coverId={book.coverId}
          size="lg"
        />
        <p className="text-center text-[12px] tracking-[0.14em] text-ink-muted uppercase md:text-left">
          {book.year ? `First published ${book.year}` : "Cover appears on pick"}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          <span className="block font-serif text-[11px] tracking-[0.22em] text-ink-muted uppercase">
            Book
          </span>
          <BookSearchField
            value={book.title}
            onChange={(title) => setBook((current) => ({ ...current, title }))}
            onSelect={handleSelect}
            label="Book title"
            placeholder="Start typing a title..."
            required
            className="w-full border-0 border-b border-line bg-transparent px-0 py-2 font-serif text-xl tracking-[0.06em] text-ink outline-none transition-colors focus:border-rose"
          />
          <input
            type="text"
            value={book.author}
            onChange={(event) =>
              setBook((current) => ({ ...current, author: event.target.value }))
            }
            required
            aria-label="Author"
            placeholder="Author"
            className="w-full border-0 border-b border-line bg-transparent px-0 py-2 text-sm text-ink-muted outline-none transition-colors focus:border-rose focus:text-ink"
          />
          <p className="pt-1 text-[13px] text-ink-muted">
            Suggestions come from Open Library — picking one fills the author
            and cover.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-line py-5">
          <span className="font-serif text-[11px] tracking-[0.22em] text-rose uppercase">
            Your Rating
          </span>
          <StarRatingInput value={rating} onChange={setRating} size="xl" />
        </div>

        <fieldset className="space-y-3">
          <legend className="font-serif text-[11px] tracking-[0.22em] text-ink-muted uppercase">
            Tags
          </legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const active = selected.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-pressed={active}
                  className={`border px-2.5 py-1.5 text-[13px] tracking-wide transition-colors ${
                    active
                      ? "border-rose bg-rose/20 text-rose-soft"
                      : "border-line/70 text-ink-muted hover:border-rose hover:text-rose"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block space-y-2">
          <span className="font-serif text-[11px] tracking-[0.22em] text-ink-muted uppercase">
            Review
          </span>
          <textarea
            name="text"
            required
            rows={8}
            className="w-full resize-y border border-line bg-bg/60 px-4 py-3 text-ink outline-none transition-colors focus:border-rose"
            placeholder="What haunted you? What stayed with you after the last page?"
          />
        </label>

        {error ? (
          <p className="border border-rose/40 bg-rose/10 px-3 py-2 text-sm text-rose-soft">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
          <Link
            href="/"
            className="font-serif text-[12px] tracking-[0.18em] text-ink-muted uppercase hover:text-rose"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="border border-rose bg-rose/15 px-6 py-3 font-serif text-[12px] tracking-[0.26em] text-rose-soft uppercase transition-colors hover:bg-rose/25 disabled:opacity-50"
          >
            {pending ? "Publishing..." : "Publish Review →"}
          </button>
        </div>
      </div>
    </form>
  );
}
