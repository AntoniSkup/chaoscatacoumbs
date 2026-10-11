"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { coverUrl, type BookSuggestion } from "@/lib/openlibrary";

type BookSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (book: BookSuggestion) => void;
  label: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

export function BookSearchField({
  value,
  onChange,
  onSelect,
  label,
  placeholder,
  className = "",
  required,
}: BookSearchFieldProps) {
  const [results, setResults] = useState<BookSuggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [open, setOpen] = useState(false);
  // Titles we put in the field ourselves should not trigger a new search.
  const skip = useRef<string | null>(value);
  const listId = useId();

  useEffect(() => {
    const term = value.trim();
    if (term.length < 2 || term === skip.current) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");

      try {
        const response = await fetch(
          `/api/books/search?q=${encodeURIComponent(term)}`,
          { signal: controller.signal },
        );

        if (!response.ok) throw new Error("Search failed.");

        const data = (await response.json()) as { results: BookSuggestion[] };
        setResults(data.results);
        setActive(-1);
        setOpen(true);
        setStatus("idle");
      } catch {
        if (controller.signal.aborted) return;
        setResults([]);
        setStatus("error");
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [value]);

  function handleChange(next: string) {
    skip.current = null;
    onChange(next);

    if (next.trim().length < 2) {
      setResults([]);
      setActive(-1);
      setOpen(false);
      setStatus("idle");
    }
  }

  function choose(book: BookSuggestion) {
    skip.current = book.title;
    onSelect(book);
    setResults([]);
    setActive(-1);
    setOpen(false);
    setStatus("idle");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!open || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      choose(results[active]);
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
    }
  }

  const expanded = open && results.length > 0;

  return (
    <div className="relative" onBlur={handleBlur}>
      <input
        type="text"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setOpen(results.length > 0)}
        onKeyDown={handleKeyDown}
        required={required}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          active >= 0 ? `${listId}-option-${active}` : undefined
        }
        aria-label={label}
        placeholder={placeholder}
        className={className}
      />

      {status === "loading" ? (
        <p className="mt-1 text-[12px] tracking-[0.16em] text-ink-muted uppercase">
          Searching Open Library...
        </p>
      ) : null}

      {status === "error" ? (
        <p className="mt-1 text-[12px] tracking-[0.16em] text-rose-soft uppercase">
          Open Library is unreachable — keep typing by hand.
        </p>
      ) : null}

      {expanded ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Book suggestions"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto border border-line bg-bg-elevated shadow-lg shadow-black/50"
        >
          {results.map((book, index) => (
            <li
              key={book.key}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === active}
            >
              <button
                type="button"
                onClick={() => choose(book)}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  index === active ? "bg-rose/15" : ""
                }`}
              >
                {book.coverId ? (
                  <Image
                    src={coverUrl(book.coverId, "S")}
                    alt=""
                    width={34}
                    height={50}
                    className="h-[50px] w-[34px] shrink-0 border border-line/60 object-cover"
                  />
                ) : (
                  <span className="h-[50px] w-[34px] shrink-0 border border-line/60 bg-bg" />
                )}

                <span className="min-w-0">
                  <span className="block truncate font-serif text-xs tracking-wide text-ink">
                    {book.title}
                  </span>
                  <span className="block truncate text-[13px] text-ink-muted">
                    {book.author}
                    {book.year ? ` · ${book.year}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
