import Image from "next/image";
import type { NewBook } from "@/lib/books";
import { CoverPlaceholder } from "./BookCover";

function storeSearchUrl(title: string): string {
  return `https://oceanofpdf.com/?s=${encodeURIComponent(title)}`;
}

function formatPublished(date: string): string {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function NewBookCard({ book }: { book: NewBook }) {
  return (
    <article className="group relative flex h-full flex-col border border-line bg-bg-elevated/50 p-3 transition-colors hover:border-line-strong">
      {/* Sits above the cover, which is positioned for the fill image. */}
      <a
        href={storeSearchUrl(book.title)}
        target="_blank"
        rel="noreferrer noopener"
        className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
      >
        <span className="sr-only">Search Ocean of PDF for {book.title}</span>
      </a>

      <div className="relative h-56 w-full overflow-hidden border border-line/60 bg-bg">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain"
          />
        ) : (
          <CoverPlaceholder title={book.title} author={book.authors} />
        )}
      </div>

      {book.publishedDate ? (
        <p className="mt-3 font-serif text-[11px] tracking-[0.16em] text-rose uppercase">
          {formatPublished(book.publishedDate)}
        </p>
      ) : null}

      <h3 className="mt-1 line-clamp-2 font-serif text-sm leading-snug tracking-wide text-ink">
        {book.title}
      </h3>
      <p className="text-xs text-ink-muted">{book.authors}</p>

      {book.description ? (
        <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-ink/85">
          {book.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <p className="mt-4 font-serif text-[11px] tracking-[0.16em] text-rose uppercase transition-colors group-hover:text-rose-soft">
        Find it on Ocean →
      </p>
    </article>
  );
}
