const API_URL = "https://www.googleapis.com/books/v1/volumes";

export type NewBook = {
  id: string;
  title: string;
  authors: string;
  publishedDate: string;
  description: string;
  categories: string[];
  coverUrl?: string;
};

// Google's `subject:` operator currently returns totalItems=0 for every shelf,
// so these are plain keyword queries, which do come back populated.
export const SHELVES = [
  { slug: "romance", label: "Romance", query: "romance novel" },
  { slug: "fantasy", label: "Fantasy", query: "fantasy novel" },
  { slug: "thriller", label: "Thriller", query: "thriller novel" },
  { slug: "mystery", label: "Mystery", query: "mystery novel" },
  {
    slug: "contemporary",
    label: "Contemporary",
    query: "contemporary fiction",
  },
  {
    slug: "young-adult",
    label: "Young Adult",
    query: "young adult fiction",
  },
] as const;

export type ShelfSlug = (typeof SHELVES)[number]["slug"];

export const DEFAULT_SHELF: ShelfSlug = "romance";

export function resolveShelf(slug: string | undefined) {
  return SHELVES.find((shelf) => shelf.slug === slug) ?? SHELVES[0];
}

type ImageLinks = { thumbnail?: string; smallThumbnail?: string };

type GoogleVolume = {
  id?: string;
  accessInfo?: { embeddable?: boolean };
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    categories?: string[];
    imageLinks?: ImageLinks;
  };
};

// Google returns http URLs with a page-curl overlay baked in. zoom=2 upgrades
// the 128px thumbnail to 300px, but only volumes Google can embed actually have
// that scan: for the rest the content endpoint answers 200 with a blank 300x48
// strip, which renders as a broken-looking sliver. Those keep the thumbnail.
function coverUrl(
  links: ImageLinks | undefined,
  embeddable: boolean,
): string | undefined {
  const raw = links?.thumbnail ?? links?.smallThumbnail;
  if (!raw) return undefined;

  const url = raw.replace(/^http:/, "https:").replace("&edge=curl", "");
  return embeddable ? url.replace("zoom=1", "zoom=2") : url;
}

function toNewBook(volume: GoogleVolume): NewBook | undefined {
  const info = volume.volumeInfo;
  if (!volume.id || !info?.title || !info.authors?.length) return undefined;

  const title = info.subtitle
    ? `${info.title}: ${info.subtitle}`
    : info.title;

  return {
    id: volume.id,
    title,
    authors: info.authors.join(", "),
    publishedDate: info.publishedDate ?? "",
    description: info.description ?? "",
    categories: info.categories ?? [],
    coverUrl: coverUrl(info.imageLinks, volume.accessInfo?.embeddable === true),
  };
}

export type BooksResult =
  | { status: "ok"; books: NewBook[]; stale: boolean }
  | { status: "quota" }
  | { status: "error" };

type VolumesOutcome =
  | { kind: "ok"; volumes: GoogleVolume[] }
  | { kind: "quota" }
  | { kind: "error" };

// Google's Books backend sheds load with `backendFailed` 503s, and a bad spell
// means most calls: 23 of 25 at the worst point measured. A sequential chain
// loses too many shelves to that, so a round that has to retry sends several
// requests at once and keeps the first usable answer.
const ROUND_DELAYS_MS = [300, 700, 1200];
const LANES_PER_ROUND = 3;
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const QUOTA_REASONS = new Set([
  "rateLimitExceeded",
  "userRateLimitExceeded",
  "dailyLimitExceeded",
  "quotaExceeded",
]);

const lastGoodShelf = new Map<ShelfSlug, NewBook[]>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readFailureReason(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      error?: { message?: string; errors?: { reason?: string }[] };
    };
    const reason = body.error?.errors?.[0]?.reason;
    return reason ?? body.error?.message ?? "unknown";
  } catch {
    return "unparseable body";
  }
}

// "transient" is worth another request; every other outcome is final.
type AttemptOutcome = VolumesOutcome | { kind: "transient" };

async function attemptVolumes(
  params: URLSearchParams,
): Promise<AttemptOutcome> {
  try {
    const response = await fetch(`${API_URL}?${params}`, {
      next: { revalidate: 60 * 60 * 6, tags: ["new-books"] },
    });

    if (response.ok) {
      const data = (await response.json()) as { items?: GoogleVolume[] };
      return { kind: "ok", volumes: data.items ?? [] };
    }

    const reason = await readFailureReason(response);
    // Upstream failure is expected here and every outcome is rendered as a
    // real state by the page, so this stays below console.error — which the
    // dev overlay would otherwise raise as an unhandled application error.
    console.warn(`[books] Google Books ${response.status} (${reason})`);

    // A quota refusal will not fix itself on retry.
    if (QUOTA_REASONS.has(reason) && response.status !== 503) {
      return { kind: "quota" };
    }

    return TRANSIENT_STATUSES.has(response.status)
      ? { kind: "transient" }
      : { kind: "error" };
  } catch (cause) {
    console.warn("[books] request threw", cause);
    return { kind: "transient" };
  }
}

function firstUsable(outcomes: AttemptOutcome[]): AttemptOutcome {
  return (
    outcomes.find((outcome) => outcome.kind === "ok") ??
    outcomes.find((outcome) => outcome.kind === "quota") ??
    outcomes.find((outcome) => outcome.kind === "error") ?? {
      kind: "transient",
    }
  );
}

async function requestVolumes(
  params: URLSearchParams,
): Promise<VolumesOutcome> {
  // The opening call is the plain URL, so a warm cache or a healthy backend
  // costs exactly one request. Only a refusal widens the rounds.
  let outcome = await attemptVolumes(params);

  for (const [round, delay] of ROUND_DELAYS_MS.entries()) {
    if (outcome.kind !== "transient") break;
    await sleep(delay);

    // Next memoises identical fetches within a render, which would collapse a
    // round back into one request. Google ignores the extra parameter.
    const lanes = Array.from({ length: LANES_PER_ROUND }, (_, lane) => {
      const laneParams = new URLSearchParams(params);
      laneParams.set("lane", `${round}-${lane}`);
      return attemptVolumes(laneParams);
    });

    outcome = firstUsable(await Promise.all(lanes));
  }

  return outcome.kind === "transient" ? { kind: "error" } : outcome;
}

function withKey(params: URLSearchParams): URLSearchParams {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) params.set("key", key);
  return params;
}

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// The same work comes back as several editions, and Google credits them
// inconsistently — "SenLin Yu", "SenLinYu" and "Senlinyu" are one author — so
// spacing and punctuation cannot be part of an edition's identity.
function fingerprint(book: NewBook): string {
  return normalize(`${book.title} ${book.authors}`).replace(/ /g, "");
}

function collectBooks(volumes: GoogleVolume[]): NewBook[] {
  const seen = new Set<string>();
  const books: NewBook[] = [];

  for (const volume of volumes) {
    const book = toNewBook(volume);
    if (!book) continue;

    const id = fingerprint(book);
    if (seen.has(id)) continue;

    seen.add(id);
    books.push(book);
  }

  return books;
}

export async function getNewBooks(shelf: ShelfSlug): Promise<BooksResult> {
  const { query } = resolveShelf(shelf);

  const outcome = await requestVolumes(
    withKey(
      new URLSearchParams({
        q: query,
        orderBy: "newest",
        printType: "books",
        langRestrict: "en",
        maxResults: "40",
      }),
    ),
  );

  if (outcome.kind !== "ok") {
    // Anonymous requests share one exhausted global quota, so "quota" means
    // "this install needs its own key".
    if (outcome.kind === "quota") return { status: "quota" };

    const cached = lastGoodShelf.get(shelf);
    return cached ? { status: "ok", books: cached, stale: true } : { status: "error" };
  }

  const books = collectBooks(outcome.volumes);

  if (books.length > 0) {
    lastGoodShelf.set(shelf, books);
    return { status: "ok", books, stale: false };
  }

  // Google sometimes answers 200 with an empty body while it is degraded.
  const cached = lastGoodShelf.get(shelf);
  return cached
    ? { status: "ok", books: cached, stale: true }
    : { status: "ok", books: [], stale: false };
}

// `q=` searches the full text of every volume, so "fourth wing" matches an
// 1874 survey of North American birds that uses both words somewhere, and
// Google ranks it above the book that was meant. Ratings come back empty here,
// so there is no popularity signal to sort on and the match has to be proven
// against the title and author instead. Scores are tiers, not weights.
function relevance(book: NewBook, term: string): number {
  const title = normalize(book.title);
  const authors = normalize(book.authors);
  const phrase = normalize(term);
  const words = phrase.split(" ");

  if (title === phrase) return 4;
  // A full name is a search for that author, and their own books should beat
  // the biographies of them. One word is too thin to read that way: "king" is
  // far likelier to be a title than a request for Stephen King.
  if (words.length > 1 && authors.includes(phrase)) return 3;
  if (title.includes(phrase)) return 2;
  if (words.every((word) => title.includes(word))) return 1;
  if (words.every((word) => authors.includes(word))) return 0.5;

  return 0;
}

// Search terms are user-typed and unbounded, so there is no last-good cache to
// fall back on here: a failed search says so rather than answering with the
// results of somebody else's.
export async function searchBookVolumes(query: string): Promise<BooksResult> {
  const term = query.trim();
  if (!term) return { status: "ok", books: [], stale: false };

  const outcome = await requestVolumes(
    withKey(
      new URLSearchParams({
        q: term,
        printType: "books",
        maxResults: "40",
      }),
    ),
  );

  if (outcome.kind === "quota") return { status: "quota" };
  if (outcome.kind === "error") return { status: "error" };

  // Sort is stable, so Google's own ranking still decides the order inside a
  // tier — this only moves the books that actually match the term above it.
  const scored = collectBooks(outcome.volumes)
    .map((book) => ({ book, score: relevance(book, term) }))
    .sort((a, b) => b.score - a.score);

  // A topical search ("space opera") can match nothing by title or author, and
  // Google's own guesses beat an empty page.
  const matched = scored.filter((match) => match.score > 0);
  const books = (matched.length > 0 ? matched : scored).map(
    (match) => match.book,
  );

  return { status: "ok", books, stale: false };
}
