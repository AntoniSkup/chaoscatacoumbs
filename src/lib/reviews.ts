import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { CATEGORIES } from "./categories";

export type Review = {
  id: string;
  title: string;
  author: string;
  categories: string[];
  rating: number;
  text: string;
  favorite: boolean;
  createdAt: string;
  coverId: number | null;
};

export type CurrentlyReading = {
  title: string;
  author: string;
  progress: number;
  note: string;
  coverId: number | null;
};

type Store = {
  reviews: Review[];
  currentlyReading: CurrentlyReading;
};

const blobPathname = "store.json";
const localStoreFile = path.join(process.cwd(), "data", "store.json");

const seedStore: Store = {
  currentlyReading: {
    title: "The Perfect Marriage",
    author: "Jeneva Rose",
    progress: 62,
    note: "gripping, dark and i'm obsessed...",
    coverId: null,
  },
  reviews: [
    {
      id: "seed-1",
      title: "King of Wrath",
      author: "Ana Huang",
      categories: ["Mafia", "Dark Romance", "Angst"],
      rating: 5,
      text: "This book had me in a chokehold. The tension, the obsession, the payoff — everything I love in a dark romance. Every chapter felt like a slow descent into something I had no intention of escaping.",
      favorite: true,
      createdAt: "2026-09-02T12:00:00.000Z",
      coverId: 13588136,
    },
    {
      id: "seed-2",
      title: "The Silent Patient",
      author: "Alex Michaelides",
      categories: ["Thriller", "Contemporary"],
      rating: 6,
      text: "A quiet storm of a novel. Every chapter feels like descending another stair into something darker and more brilliant. The ending rearranged my entire understanding of the book.",
      favorite: true,
      createdAt: "2026-09-14T12:00:00.000Z",
      coverId: 9407338,
    },
    {
      id: "seed-3",
      title: "A Court of Thorns and Roses",
      author: "Sarah J. Maas",
      categories: ["Fantasy", "Dark Romance", "Enemies to Lovers"],
      rating: 5,
      text: "So addictive. The world-building, the tension, the characters... I get the hype now. I lost an entire weekend to this one and I would do it again without hesitation.",
      favorite: true,
      createdAt: "2026-09-21T12:00:00.000Z",
      coverId: 15254465,
    },
    {
      id: "seed-4",
      title: "Brutal Prince",
      author: "Sophie Lark",
      categories: ["Mafia", "Marriage of Convenience", "Dark Romance"],
      rating: 4,
      text: "Dark, intense and so well written. It was the perfect mix of obsession, power and vulnerability. The arranged-marriage setup had no business being this compelling.",
      favorite: false,
      createdAt: "2026-09-28T12:00:00.000Z",
      coverId: 14133911,
    },
    {
      id: "seed-5",
      title: "Fourth Wing",
      author: "Rebecca Yarros",
      categories: ["Fantasy", "Enemies to Lovers", "Angst"],
      rating: 6,
      text: "Dragons, danger, and a heartbeat that refuses to settle. Chaos in the best possible binding. I finished it at 3am and immediately wanted to start over.",
      favorite: true,
      createdAt: "2026-10-04T12:00:00.000Z",
      coverId: 14407898,
    },
  ],
};

// Entries written before covers existed have no coverId.
function withCoverIds(store: Store): Store {
  return {
    currentlyReading: {
      ...store.currentlyReading,
      coverId: store.currentlyReading.coverId ?? null,
    },
    reviews: store.reviews.map((review) => ({
      ...review,
      coverId: review.coverId ?? null,
    })),
  };
}

// Serverless filesystems are read-only, so deployments keep the store in Vercel
// Blob. Local development without Blob credentials uses data/store.json.
function storageMode(): "blob" | "file" {
  const hasCredentials = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  );
  if (hasCredentials) return "blob";

  if (process.env.VERCEL) {
    throw new Error(
      "No Vercel Blob store is connected to this deployment. Create one in the Vercel dashboard, connect it to this project, and redeploy.",
    );
  }

  return "file";
}

async function readBlobStore(): Promise<Store | null> {
  const result = await get(blobPathname, {
    access: "private",
    useCache: false,
  });
  if (!result?.stream) return null;
  return JSON.parse(await new Response(result.stream).text()) as Store;
}

async function readLocalStore(): Promise<Store | null> {
  try {
    return JSON.parse(await fs.readFile(localStoreFile, "utf8")) as Store;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function readStore(): Promise<Store> {
  const stored =
    storageMode() === "blob" ? await readBlobStore() : await readLocalStore();

  if (!stored) {
    await writeStore(seedStore);
    return seedStore;
  }

  return withCoverIds(stored);
}

async function writeStore(store: Store): Promise<void> {
  const serialized = JSON.stringify(store, null, 2);

  if (storageMode() === "blob") {
    await put(blobPathname, serialized, {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
    });
    return;
  }

  await fs.mkdir(path.dirname(localStoreFile), { recursive: true });
  await fs.writeFile(localStoreFile, serialized, "utf8");
}

function byNewest(a: Review, b: Review): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export async function getReviews(filters?: {
  query?: string;
  category?: string;
}): Promise<Review[]> {
  const store = await readStore();
  let reviews = [...store.reviews].sort(byNewest);

  const query = filters?.query?.trim().toLowerCase();
  if (query) {
    reviews = reviews.filter((review) =>
      [review.title, review.author, review.text, review.categories.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  const category = filters?.category;
  if (category) {
    reviews = reviews.filter((review) => review.categories.includes(category));
  }

  return reviews;
}

export async function getReview(id: string): Promise<Review | undefined> {
  const store = await readStore();
  return store.reviews.find((review) => review.id === id);
}

export async function getFavorites(): Promise<Review[]> {
  const store = await readStore();
  return store.reviews.filter((review) => review.favorite).sort(byNewest);
}

export async function getCategoryCounts(): Promise<
  { name: string; count: number }[]
> {
  const store = await readStore();
  return CATEGORIES.map((name) => ({
    name,
    count: store.reviews.filter((review) => review.categories.includes(name))
      .length,
  }));
}

export async function addReview(
  input: Omit<Review, "id" | "createdAt">,
): Promise<Review> {
  const store = await readStore();
  const review: Review = {
    ...input,
    id: `review-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.reviews.unshift(review);
  await writeStore(store);
  return review;
}

export async function deleteReview(id: string): Promise<boolean> {
  const store = await readStore();
  const remaining = store.reviews.filter((review) => review.id !== id);
  if (remaining.length === store.reviews.length) return false;
  store.reviews = remaining;
  await writeStore(store);
  return true;
}

export async function toggleFavorite(id: string): Promise<Review | undefined> {
  const store = await readStore();
  const review = store.reviews.find((item) => item.id === id);
  if (!review) return undefined;
  review.favorite = !review.favorite;
  await writeStore(store);
  return review;
}

export async function getCurrentlyReading(): Promise<CurrentlyReading> {
  const store = await readStore();
  return store.currentlyReading;
}

export async function setCurrentlyReading(
  input: CurrentlyReading,
): Promise<CurrentlyReading> {
  const store = await readStore();
  store.currentlyReading = input;
  await writeStore(store);
  return store.currentlyReading;
}
