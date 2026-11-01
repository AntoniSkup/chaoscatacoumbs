import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";

const SALT_BYTES = 16;
const KEY_BYTES = 32;
const SCRYPT_OPTIONS = {
  N: 2 ** 15,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
} as const;

const PEPPER_MIN_LENGTH = 32;

export function assertPepper(): string {
  const pepper = process.env.AUTH_PEPPER ?? "";
  if (pepper.length < PEPPER_MIN_LENGTH) {
    throw new Error(
      `AUTH_PEPPER must be set to a secret of at least ${PEPPER_MIN_LENGTH} characters.`,
    );
  }
  return pepper;
}

function peppered(password: string): Buffer {
  return createHmac("sha256", assertPepper()).update(password, "utf8").digest();
}

function deriveKey(password: Buffer, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_BYTES, SCRYPT_OPTIONS, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await deriveKey(peppered(password), salt);
  return `v1.${salt.toString("base64url")}.${hash.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [version, saltEncoded, hashEncoded] = stored.split(".");
  if (version !== "v1" || !saltEncoded || !hashEncoded) return false;

  const salt = Buffer.from(saltEncoded, "base64url");
  const expected = Buffer.from(hashEncoded, "base64url");
  if (salt.length !== SALT_BYTES || expected.length !== KEY_BYTES) return false;

  const actual = await deriveKey(peppered(password), salt);

  return timingSafeEqual(actual, expected);
}
