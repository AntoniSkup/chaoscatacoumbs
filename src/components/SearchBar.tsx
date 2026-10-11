"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

type SearchBarProps = {
  compact?: boolean;
  placeholder?: string;
  destination?: string;
  label?: string;
};

export function SearchBar({
  compact = false,
  placeholder = "Search books...",
  destination = "/reviews",
  label = "Search reviews",
}: SearchBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    router.push(
      query ? `${destination}?q=${encodeURIComponent(query)}` : destination,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`flex items-center border border-line bg-bg/70 transition-colors focus-within:border-rose ${
        compact ? "h-9 w-48" : "h-11 w-full"
      }`}
    >
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-full w-full bg-transparent px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="px-3 text-rose transition-colors hover:text-rose-soft"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
