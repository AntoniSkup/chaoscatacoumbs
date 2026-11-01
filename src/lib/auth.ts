import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { assertPepper, verifyPassword } from "./password";
import {
  SESSION_SECONDS,
  createSession,
  revokeSession,
  sessionIsValid,
} from "./sessions";

export const SESSION_COOKIE = "cc_session";

const USERNAME_MAX = 64;
const PASSWORD_MAX = 256;

type Credentials = {
  username: string;
  passwordHash: string;
};

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_SECONDS,
  };
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  const length = Math.max(a.length, b.length, 1);
  const paddedA = Buffer.alloc(length);
  const paddedB = Buffer.alloc(length);
  a.copy(paddedA);
  b.copy(paddedB);
  return timingSafeEqual(paddedA, paddedB) && a.length === b.length;
}

function readCredentials(): Credentials | null {
  const passwordHash = process.env.AUTH_PASSWORD_HASH?.trim() ?? "";
  const pepper = process.env.AUTH_PEPPER ?? "";
  if (!passwordHash.startsWith("v1.") || pepper.length < 32) return null;

  const username = (process.env.AUTH_USERNAME?.trim() || "chaos").toLowerCase();
  if (!username || username.length > USERNAME_MAX) return null;
  return { username, passwordHash };
}

export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return sessionIsValid(token);
}

export async function login(
  username: string,
  password: string,
): Promise<"ok" | "invalid" | "unconfigured"> {
  const credentials = readCredentials();
  if (!credentials) return "unconfigured";

  const normalized = username.trim().toLowerCase().slice(0, USERNAME_MAX);
  const candidate = password.slice(0, PASSWORD_MAX);
  const usernameOk = safeEqual(normalized, credentials.username);

  let passwordOk = false;
  try {
    assertPepper();
    passwordOk = await verifyPassword(candidate, credentials.passwordHash);
  } catch {
    return "unconfigured";
  }

  if (!usernameOk || !passwordOk || password.length > PASSWORD_MAX) {
    return "invalid";
  }

  const token = await createSession();
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions());
  return "ok";
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(token);
  jar.delete(SESSION_COOKIE);
}
