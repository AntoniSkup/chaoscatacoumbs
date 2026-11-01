import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { hashPassword } from "../src/lib/password.ts";

const envFile = ".env.local";

function generatePepper(): string {
  return randomBytes(32).toString("base64url");
}

async function readEnvFile(): Promise<string> {
  try {
    return await readFile(envFile, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "";
    throw error;
  }
}

function upsert(contents: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(contents)) return contents.replace(pattern, line);
  const suffix = contents.length === 0 || contents.endsWith("\n") ? "" : "\n";
  return `${contents}${suffix}${line}\n`;
}

function drop(contents: string, key: string): string {
  return contents
    .replace(new RegExp(`^${key}=.*\n?`, "m"), "")
    .replace(/^\n+/, "");
}

async function readPassword(): Promise<string> {
  const fromEnv = process.env.AUTH_PASSWORD ?? "";
  if (fromEnv) return fromEnv;
  if (!input.isTTY) {
    throw new Error(
      "Pass the new password as AUTH_PASSWORD, or run this in a terminal so it can ask.",
    );
  }

  const rl = createInterface({ input, output });
  try {
    const first = await rl.question("New password: ");
    const second = await rl.question("Repeat password: ");
    if (first !== second) throw new Error("Passwords did not match.");
    return first;
  } finally {
    rl.close();
  }
}

if (!process.env.AUTH_PEPPER) {
  process.env.AUTH_PEPPER = generatePepper();
}

if (process.env.AUTH_PEPPER.length < 32) {
  console.error("AUTH_PEPPER must be at least 32 characters.");
  process.exit(1);
}

const password = await readPassword();
if (password.length < 12 || password.length > 256) {
  console.error("Password must be between 12 and 256 characters.");
  process.exit(1);
}

const passwordHash = await hashPassword(password);
let contents = await readEnvFile();
contents = upsert(contents, "AUTH_PEPPER", process.env.AUTH_PEPPER);
contents = upsert(contents, "AUTH_PASSWORD_HASH", passwordHash);
contents = drop(contents, "AUTH_PASSWORD");
if (!/^AUTH_USERNAME=/m.test(contents)) {
  contents = upsert(contents, "AUTH_USERNAME", "chaos");
}

await writeFile(envFile, contents.endsWith("\n") ? contents : `${contents}\n`, "utf8");
console.log(
  `Updated ${envFile}. Username is AUTH_USERNAME (default chaos). Copy AUTH_PEPPER, AUTH_PASSWORD_HASH, and AUTH_USERNAME to the Vercel project env, then redeploy. Do not leave AUTH_PASSWORD set.`,
);
