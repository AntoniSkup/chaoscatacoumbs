import Link from "next/link";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Reviews", href: "/reviews" },
  { label: "Explore", href: "/explore" },
  { label: "Categories", href: "/reviews#categories" },
  { label: "Currently Reading", href: "/#currently-reading" },
  { label: "Favorites", href: "/#favorites" },
  { label: "About", href: "/about" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 py-8 lg:flex-row lg:justify-between">
        <Link href="/" className="shrink-0">
          <Logo className="h-6 w-auto transition-opacity hover:opacity-80" />
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-serif text-[12px] tracking-[0.2em] text-ink-muted uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-rose"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <SocialIcons size={16} />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 pb-8 text-center">
        <p className="text-xs text-ink-muted">
          © 2026 Chaos&apos;s Catacombs. All rights reserved.
        </p>
        <p className="font-script text-xl text-rose">read more, worry less. ♡</p>
      </div>
    </footer>
  );
}
