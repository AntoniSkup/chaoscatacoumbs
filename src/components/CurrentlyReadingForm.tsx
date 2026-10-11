"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { BookSuggestion } from "@/lib/openlibrary";
import type { CurrentlyReading } from "@/lib/reviews";
import { BookCover } from "./BookCover";
import { BookSearchField } from "./BookSearchField";

export function CurrentlyReadingForm({ data }: { data: CurrentlyReading }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [book, setBook] = useState({
    title: data.title,
    author: data.author,
    coverId: data.coverId,
  });

  function handleSelect(result: BookSuggestion) {
    setBook({
      title: result.title,
      author: result.author,
      coverId: result.coverId,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/currently-reading", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: book.title,
        author: book.author,
        coverId: book.coverId,
        progress: Number(formData.get("progress")),
        note: formData.get("note"),
      }),
    });

    setPending(false);

    if (response.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 font-serif text-[11px] tracking-[0.16em] text-rose uppercase transition-colors hover:text-rose-soft"
      >
        Update progress →
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-line pt-4">
      <div className="flex gap-3">
        <div className="w-16 shrink-0">
          <BookCover
            title={book.title}
            author={book.author}
            coverId={book.coverId}
            size="sm"
          />
        </div>

        <div className="flex-1 space-y-3">
          <BookSearchField
            value={book.title}
            onChange={(title) => setBook((current) => ({ ...current, title }))}
            onSelect={handleSelect}
            label="Book title"
            placeholder="Search Open Library..."
            required
            className="w-full border border-line bg-bg/70 px-3 py-2 text-sm text-ink outline-none focus:border-rose"
          />
          <input
            value={book.author}
            onChange={(event) =>
              setBook((current) => ({ ...current, author: event.target.value }))
            }
            required
            aria-label="Author"
            className="w-full border border-line bg-bg/70 px-3 py-2 text-sm text-ink outline-none focus:border-rose"
          />
          {book.coverId ? (
            <button
              type="button"
              onClick={() =>
                setBook((current) => ({ ...current, coverId: null }))
              }
              className="font-serif text-[11px] tracking-[0.16em] text-ink-muted uppercase hover:text-rose"
            >
              Remove cover
            </button>
          ) : null}
        </div>
      </div>

      <input
        name="progress"
        type="number"
        min={0}
        max={100}
        defaultValue={data.progress}
        required
        aria-label="Progress percent"
        className="w-full border border-line bg-bg/70 px-3 py-2 text-sm text-ink outline-none focus:border-rose"
      />
      <input
        name="note"
        defaultValue={data.note}
        aria-label="Note"
        className="w-full border border-line bg-bg/70 px-3 py-2 text-sm text-ink outline-none focus:border-rose"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="border border-rose bg-rose/15 px-4 py-2 font-serif text-[11px] tracking-[0.18em] text-rose-soft uppercase disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-line px-4 py-2 font-serif text-[11px] tracking-[0.18em] text-ink-muted uppercase hover:text-rose"
        >
          Cancel
        </button>
      </div>
      <p className="text-[12px] text-ink-muted">
        Covers &amp; book data from{" "}
        <a
          href="https://openlibrary.org"
          target="_blank"
          rel="noreferrer"
          className="text-rose hover:text-rose-soft"
        >
          Open Library
        </a>
        .
      </p>
    </form>
  );
}
