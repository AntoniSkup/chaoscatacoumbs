export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Reviews", href: "/reviews" },
  { label: "Explore", href: "/explore" },
];

export const publishLink = { label: "Publish", href: "/reviews/new" };

export const navHrefs = [...navLinks, publishLink].map((link) => link.href);
 