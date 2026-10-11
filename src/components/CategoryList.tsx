import Link from "next/link";

type CategoryListProps = {
  categories: { name: string; count: number }[];
  activeCategory?: string;
  /** "grid" spreads the categories across the full content width and leaves
   *  the heading to the caller; "sidebar" is the narrow single-column list. */
  variant?: "sidebar" | "grid";
};

export function CategoryList({
  categories,
  activeCategory,
  variant = "sidebar",
}: CategoryListProps) {
  return (
    <div id="categories">
      {variant === "sidebar" ? (
        <h2 className="border-b border-line pb-2 font-serif text-xs tracking-[0.24em] text-ink uppercase">
          Categories
        </h2>
      ) : null}

      <ul
        className={
          variant === "grid"
            ? "grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3"
            : "mt-1"
        }
      >
        {categories.map((category) => {
          const active = activeCategory === category.name;
          return (
            <li key={category.name} className="border-b border-line/40">
              <Link
                href={
                  active
                    ? "/reviews"
                    : `/reviews?category=${encodeURIComponent(category.name)}`
                }
                className={`flex items-center justify-between py-2 text-sm transition-colors hover:text-rose ${
                  active ? "text-rose" : "text-ink/90"
                }`}
              >
                <span>{category.name}</span>
                <span className="text-xs text-ink-muted">
                  ({category.count})
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
