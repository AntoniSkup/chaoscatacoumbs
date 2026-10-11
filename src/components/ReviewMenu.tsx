"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ReviewMenuProps = {
  reviewId: string;
  redirectTo?: string;
};

export function ReviewMenu({ reviewId, redirectTo }: ReviewMenuProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function closeMenu() {
    setOpen(false);
    setConfirming(false);
    setError("");
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleRemove() {
    setPending(true);
    setError("");

    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setPending(false);
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "Could not remove review.");
      return;
    }

    setPending(false);
    closeMenu();

    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => (open ? closeMenu() : setOpen(true))}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Review options"
        className="inline-flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-rose"
      >
        <svg
          aria-hidden
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-48 border border-line bg-bg-elevated p-1 shadow-lg shadow-black/50"
        >
          {confirming ? (
            <div className="space-y-2 p-2">
              <p className="text-xs leading-snug text-ink-muted">
                Remove this review for good?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={pending}
                  className="flex-1 border border-rose bg-rose/15 px-2 py-1.5 font-serif text-[11px] tracking-[0.16em] text-rose-soft uppercase transition-colors hover:bg-rose/25 disabled:opacity-50"
                >
                  {pending ? "Removing..." : "Remove"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                  className="flex-1 border border-line px-2 py-1.5 font-serif text-[11px] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50"
                >
                  Keep
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirming(true)}
              className="block w-full px-3 py-2 text-left font-serif text-[12px] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:bg-rose/10 hover:text-rose"
            >
              Remove review
            </button>
          )}

          {error ? (
            <p className="px-3 py-2 text-[13px] text-rose-soft">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
