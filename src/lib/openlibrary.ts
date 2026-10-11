export type BookSuggestion = {
  key: string;
  title: string;
  author: string;
  coverId: number | null;
  year: number | null;
};

const SEARCH_URL = "https://openlibrary.org/search.json";
const COVERS_URL = "https://covers.openlibrary.org/b/id";

export const COVERS_HOSTNAME = "covers.openlibrary.org";

export function coverUrl(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `${COVERS_URL}/${coverId}-${size}.jpg`;
}

type SearchDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
};

export async function searchBooks(
  query: string,
  limit = 8,
): Promise<BookSuggestion[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "fields",
    "key,title,author_name,cover_i,first_publish_year",
  );

  const response = await fetch(url, {
    headers: {
      // Open Library asks for an identifying agent on API traffic.
      "User-Agent": "ChaosCatacombs/1.0 (book review journal)",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Open Library responded with ${response.status}`);
  }

  const data = (await response.json()) as { docs?: SearchDoc[] };

  return (data.docs ?? []).flatMap((doc) => {
    if (!doc.title || !doc.key) return [];
    return [
      {
        key: doc.key,
        title: doc.title,
        author: doc.author_name?.[0] ?? "Unknown author",
        coverId: doc.cover_i ?? null,
        year: doc.first_publish_year ?? null,
      },
    ];
  });
}
