import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const empty = JSON.stringify({ sessions: [] }, null, 2);

if (process.argv.includes("--blob")) {
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "No Blob credentials found. Run `vercel env pull .env.blob` and try again.",
    );
    process.exit(1);
  }

  await put("sessions.json", empty, {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });
  console.log("Revoked every session in the Blob store.");
} else {
  const file = path.join("data", "sessions.json");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${empty}\n`, "utf8");
  console.log("Revoked every local session in data/sessions.json.");
}
