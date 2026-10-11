"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Review } from "@/lib/reviews";

/* The unlayered `button { font: inherit }` reset in globals.css outranks any
   font-size utility on the button itself, so the glyph carries its own size. */
const sizeClasses = {
  md: { box: "h-11 w-11", glyph: "text-[30px]" },
  lg: { box: "h-14 w-14", glyph: "text-[44px]" },
};

export function FavoriteButton({
  review,
  size = "md",
}: {
  review: Review;
  size?: keyof typeof sizeClasses;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(review.favorite);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    const response = await fetch(`/api/reviews/${review.id}/favorite`, {
      method: "POST",
    });
    setPending(false);

    if (response.ok) {
      const updated = (await response.json()) as Review;
      setFavorite(updated.favorite);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={favorite}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      className={`inline-flex shrink-0 items-center justify-center text-rose transition-transform hover:scale-110 disabled:opacity-50 ${sizeClasses[size].box}`}
    >
      <span aria-hidden className={`leading-none ${sizeClasses[size].glyph}`}>
        {favorite ? "♥" : "♡"}
      </span>
    </button>
  );
}
