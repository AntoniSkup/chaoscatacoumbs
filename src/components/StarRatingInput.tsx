"use client";

import { useState, type KeyboardEvent } from "react";
import { Star, starSizes, type StarSize } from "./StarRating";

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: StarSize;
};

export function StarRatingInput({
  value,
  onChange,
  max = 6,
  size = "xl",
}: StarRatingInputProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(max, value + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(1, value - 1));
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex items-center gap-1.5 text-rose"
        role="radiogroup"
        aria-label={`Rating, ${value} out of ${max} stars`}
        onMouseLeave={() => setHover(0)}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={starValue === value}
              aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onFocus={() => setHover(starValue)}
              onBlur={() => setHover(0)}
              className="cursor-pointer rounded-sm transition-transform hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-rose"
            >
              <Star
                filled={starValue <= shown}
                className={`${starSizes[size]} transition-colors ${
                  starValue <= shown ? "text-rose-soft" : "text-rose/30"
                }`}
              />
            </button>
          );
        })}
      </div>

      <span className="font-serif text-sm tracking-[0.12em] text-ink-muted">
        {shown} / {max}
      </span>
    </div>
  );
}
