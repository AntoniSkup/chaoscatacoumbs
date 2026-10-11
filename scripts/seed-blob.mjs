import { readFile } from "node:fs/promises";
import { get, put } from "@vercel/blob";

const PATHNAME = "store.json";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    "BLOB_READ_WRITE_TOKEN is missing. Run `vercel env pull .env.local` and try again.",
  );
  process.exit(1);
}

const existing = await get(PATHNAME, { access: "private", useCache: false });
if (existing && !process.argv.includes("--force")) {
  console.error(
    `${PATHNAME} already exists in the Blob store. Re-run with --force to overwrite it.`,
  );
  process.exit(1);
}

const contents = await readFile("data/store.json", "utf8");
const { reviews } = JSON.parse(contents);

const blob = await put(PATHNAME, contents, {
  access: "private",
  contentType: "application/json",
  allowOverwrite: true,
});

console.log(`Uploaded ${blob.pathname} with ${reviews.length} reviews`);
