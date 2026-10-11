"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });

    setPending(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Login failed.");
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-5">
      <label className="block space-y-2">
        <span className="font-serif text-[13px] tracking-[0.22em] text-rose uppercase">
          Username
        </span>
        <input
          name="username"
          type="text"
          required
          autoComplete="username"
          className="w-full border border-line bg-bg/80 px-4 py-3 text-ink outline-none transition-colors focus:border-rose"
          placeholder="chaos"
        />
      </label>

      <label className="block space-y-2">
        <span className="font-serif text-[13px] tracking-[0.22em] text-rose uppercase">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-line bg-bg/80 px-4 py-3 text-ink outline-none transition-colors focus:border-rose"
          placeholder="••••••••"
        />
      </label>

      {error ? (
        <p className="border border-rose/40 bg-rose/10 px-3 py-2 text-sm text-rose-soft">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-rose bg-rose/15 px-4 py-3 font-serif text-xs tracking-[0.28em] text-rose-soft uppercase transition-colors hover:bg-rose/25 disabled:opacity-50"
      >
        {pending ? "Entering..." : "Enter the Catacombs"}
      </button>
    </form>
  );
}
