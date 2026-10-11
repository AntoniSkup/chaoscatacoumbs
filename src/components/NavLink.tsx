"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { navHrefs } from "./nav-links";

function matches(pathname: string, path: string) {
  return path === "/"
    ? pathname === "/"
    : pathname === path || pathname.startsWith(`${path}/`);
}

export function NavLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Nav entries may point at an anchor on a page ("/#favorites"); only the
  // page part decides whether the link is the one we're on.
  const path = href.split("#")[0] || "/";
  // "/reviews" also prefix-matches "/reviews/new", so defer to the more
  // specific nav entry whenever one of them matches too.
  const active =
    matches(pathname, path) &&
    !navHrefs.some(
      (other) => other.length > path.length && matches(pathname, other),
    );

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border-b pb-1 transition-colors hover:text-rose ${
        active ? "border-rose text-rose" : "border-transparent"
      } ${className}`}
    >
      {children}
    </Link>
  );
}
