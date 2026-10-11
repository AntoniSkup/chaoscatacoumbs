import Link from "next/link";
import type { Review } from "@/lib/reviews";
import { BookCover } from "./BookCover";
import { FavoriteButton } from "./FavoriteButton";
import { ReviewMenu } from "./ReviewMenu";
import { StarRating } from "./StarRating";

type ReviewCardProps = {
  review: Review;
  canEdit?: boolean;
};

export function ReviewCard({ review, canEdit = false }: ReviewCardProps) {
  return (
    <article className="group relative flex h-full flex-col border border-line bg-bg-elevated/50 p-3 transition-colors hover:border-line-strong">
      <Link
        href={`/reviews/${review.id}`}
        className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
      >
        <span className="sr-only">Read full review of {review.title}</span>
      </Link>

      <div className="mx-auto w-full max-w-[170px]">
        <BookCover
          title={review.title}
          author={review.author}
          coverId={review.coverId}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size="md" />
          <span className="text-sm text-ink-muted">{review.rating}/6</span>
        </div>
        {canEdit ? (
          <div className="relative z-10">
            <ReviewMenu reviewId={review.id} />
          </div>
        ) : null}
      </div>

      <h3 className="mt-2 font-serif text-sm leading-snug tracking-wide text-ink">
        {review.title}
      </h3>
      <p className="text-xs text-ink-muted">{review.author}</p>

      <p className="mt-2 font-serif text-[11px] tracking-[0.14em] text-rose uppercase">
        {review.categories.join(" · ")}
      </p>

      <div className="mt-3 flex-1">
        <p className="line-clamp-4 text-sm leading-relaxed text-ink/85">
          {review.text}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="font-serif text-[11px] tracking-[0.16em] text-rose uppercase transition-colors group-hover:text-rose-soft">
          Read full review →
        </p>
        {canEdit ? (
          <div className="relative z-10 -my-2 -mr-1">
            <FavoriteButton review={review} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
