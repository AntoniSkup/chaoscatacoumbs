import { cookies } from "next/headers";

export const SESSION_COOKIE = "chaos_session";
export const DEMO_USER = "chaos";
export const DEMO_PASSWORD = "catacombs";

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value === "authenticated";
}
