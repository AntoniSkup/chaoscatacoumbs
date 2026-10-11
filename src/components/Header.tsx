import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { navLinks, publishLink } from "./nav-links";
import { NavLink } from "./NavLink";
import { SearchBar } from "./SearchBar";

export function Header({ authenticated }: { authenticated: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-4 lg:flex-row lg:justify-between">
        <Link href="/" className="shrink-0">
          <Logo
            priority
            className="h-7 w-auto transition-opacity hover:opacity-80 lg:h-8"
          />
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-serif text-[12px] tracking-[0.2em] text-ink-muted uppercase">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ))}
          {authenticated ? (
            <NavLink
              href={publishLink.href}
              className="text-rose hover:text-rose-soft"
            >
              {publishLink.label}
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Suspense fallback={<div className="h-9 w-48" />}>
              <SearchBar compact />
            </Suspense>
          </div>
          {authenticated ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="border border-line-strong px-3 py-2 font-serif text-[12px] tracking-[0.2em] text-rose uppercase transition-colors hover:bg-rose/10"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
