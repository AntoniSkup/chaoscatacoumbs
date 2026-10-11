export type StarSize = "sm" | "md" | "lg" | "xl";

export const starSizes: Record<StarSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
  xl: "h-9 w-9",
};

export function Star({
  filled,
  className = "",
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.25}
      strokeLinejoin="round"
    >
      <path d="M12 2.6l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.67l-5.9 3.1 1.13-6.57L2.45 9.54l6.6-.96L12 2.6z" />
    </svg>
  );
}

type StarRatingProps = {
  value: number;
  max?: number;
  size?: StarSize;
};

export function StarRating({ value, max = 6, size = "md" }: StarRatingProps) {
  return (
    <div
      className={`flex items-center text-rose ${size === "sm" ? "gap-0.5" : "gap-1"}`}
      role="img"
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => (
        <Star
          key={index}
          filled={index < value}
          className={`${starSizes[size]} ${index < value ? "" : "text-rose/40"}`}
        />
      ))}
    </div>
  );
}
