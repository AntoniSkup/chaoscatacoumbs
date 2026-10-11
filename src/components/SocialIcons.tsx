type SocialIconsProps = {
  size?: number;
  className?: string;
};

const links = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
  { label: "Goodreads", href: "https://goodreads.com" },
];

function Icon({ label, size }: { label: string; size: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (label) {
    case "Instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "TikTok":
      return (
        <svg {...common}>
          <path d="M14 3v10.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 3c.6 2.4 2.2 3.8 4.5 4" />
        </svg>
      );
    case "Pinterest":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 20.5 12.8 8" />
          <path d="M8.8 14.3c-.9-2.6.4-5.4 3.3-5.9 2.6-.5 4.6 1 4.6 3.4 0 2.6-1.6 4.6-3.6 4.6-1 0-1.9-.6-2.2-1.4" />
        </svg>
      );
    case "Goodreads":
      return (
        <svg {...common}>
          <circle cx="12" cy="10" r="5" />
          <path d="M17 5v10c0 3.3-2 5-5 5-2.1 0-3.7-.9-4.5-2.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />
        </svg>
      );
  }
}

export function SocialIcons({ size = 18, className = "" }: SocialIconsProps) {
  return (
    <div className={`flex items-center gap-4 text-rose ${className}`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="transition-colors hover:text-rose-soft"
        >
          <Icon label={link.label} size={size} />
        </a>
      ))}
      <span aria-hidden className="text-rose/70">
        <Icon label="Heart" size={size} />
      </span>
    </div>
  );
}
