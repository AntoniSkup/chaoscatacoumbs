"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="border border-line px-3 py-2 font-serif text-[13px] tracking-[0.2em] text-ink-muted uppercase transition-colors hover:border-rose hover:text-rose disabled:opacity-50"
    >
      {pending ? "..." : "Logout"}
    </button>
  );
}
