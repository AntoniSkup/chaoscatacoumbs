import { get, put } from "@vercel/blob";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export const SESSION_SECONDS = 60 * 60 * 24 * 7;
const MAX_SESSIONS = 10;

type SessionRecord = {
  tokenHash: string;
  expiresAt: string;
};

type SessionStore = {
  sessions: SessionRecord[];
};

const blobPathname = "sessions.json";
const localStoreFile = path.join(process.cwd(), "data", "sessions.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function storageMode(): "blob" | "file" {
  if (!process.env.VERCEL) return "file";

  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "No Vercel Blob store is connected to this deployment. Connect one from the store's Projects tab and redeploy.",
    );
  }

  return "blob";
}

function exclusive<T>(operation: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(operation, operation);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function hashesMatch(stored: string, actual: string): boolean {
  const left = Buffer.from(stored);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}

function live(session: SessionRecord, now: string): boolean {
  return session.expiresAt > now;
}

async function readStore(): Promise<SessionStore> {
  try {
    const serialized =
      storageMode() === "blob"
        ? await readBlobStore()
        : await fs.readFile(localStoreFile, "utf8");
    if (!serialized) return { sessions: [] };
    const parsed = JSON.parse(serialized) as Partial<SessionStore>;
    return { sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [] };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { sessions: [] };
    }
    throw error;
  }
}

async function readBlobStore(): Promise<string | null> {
  const result = await get(blobPathname, {
    access: "private",
    useCache: false,
  });
  if (!result?.stream) return null;
  return new Response(result.stream).text();
}

async function writeStore(store: SessionStore): Promise<void> {
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

export async function createSession(): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();

  await exclusive(async () => {
    const now = new Date().toISOString();
    const sessions = (await readStore()).sessions.filter((session) =>
      live(session, now),
    );
    sessions.push({ tokenHash, expiresAt });
    await writeStore({ sessions: sessions.slice(-MAX_SESSIONS) });
  });

  return token;
}

export async function sessionIsValid(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();
  const { sessions } = await readStore();
  return sessions.some(
    (session) => live(session, now) && hashesMatch(session.tokenHash, tokenHash),
  );
}

export async function revokeSession(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await exclusive(async () => {
    const now = new Date().toISOString();
    const sessions = (await readStore()).sessions.filter(
      (session) =>
        live(session, now) && !hashesMatch(session.tokenHash, tokenHash),
    );
    await writeStore({ sessions });
  });
}

export async function revokeAllSessions(): Promise<void> {
  await exclusive(() => writeStore({ sessions: [] }));
}
