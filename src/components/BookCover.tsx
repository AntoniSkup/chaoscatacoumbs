import Image from "next/image";
import { coverUrl } from "@/lib/openlibrary";

type CoverSize = "sm" | "md" | "lg";

type BookCoverProps = {
  title: string;
  author: string;
  size?: CoverSize;
  coverId?: number | null;
};

// Covers keep a 2:3 book ratio and take their height from the container width,
// so a cover never stretches differently from the one next to it.
const frame =
  "relative aspect-[2/3] w-full overflow-hidden border border-line/60 bg-bg";

const textSizes = {
  sm: "text-[10px]",
  md: "text-[12px]",
  lg: "text-sm",
};

const remoteSizes = {
  sm: "M",
  md: "L",
  lg: "L",
} as const;

const imageSizes = {
  sm: "96px",
  md: "(min-width: 640px) 180px, 45vw",
  lg: "200px",
};

export function BookCover({
  title,
  author,
  size = "md",
  coverId,
}: BookCoverProps) {
  if (coverId) {
    return (
      <div className={frame}>
        <Image
          src={coverUrl(coverId, remoteSizes[size])}
          alt={`${title} by ${author}`}
          fill
          sizes={imageSizes[size]}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={frame}>
      <CoverPlaceholder title={title} author={author} size={size} />
    </div>
  );
}

// Fills whatever frame it is dropped into, so a coverless book still reads as
// a cover wherever one is expected.
export function CoverPlaceholder({
  title,
  author,
  size = "md",
}: {
  title: string;
  author: string;
  size?: CoverSize;
}) {
  return (
    <div
      className={`absolute inset-0 ${textSizes[size]} flex flex-col items-center justify-center bg-[linear-gradient(160deg,#241317_0%,#140b0d_45%,#070506_100%)] px-3 text-center`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,168,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-line-strong/60" />
      <p className="relative line-clamp-5 font-serif tracking-[0.18em] text-rose-soft uppercase">
        {title}
      </p>
      <span className="relative my-2 block h-px w-8 bg-rose/50" />
      <p className="relative line-clamp-2 text-[0.85em] tracking-wide text-ink-muted uppercase">
        {author}
      </p>
    </div>
  );
}
