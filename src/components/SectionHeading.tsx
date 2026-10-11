import Link from "next/link";

type SectionHeadingProps = {
  id: string;
  title: string;
  action?: { href: string; label: string };
};

export function SectionHeading({ id, title, action }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
      <h2
        id={id}
        className="font-serif text-lg tracking-[0.24em] text-ink uppercase sm:text-xl"
      >
        {title}
      </h2>
      <span aria-hidden className="h-px min-w-8 flex-1 bg-line" />
      {action ? (
        <Link
          href={action.href}
          className="font-serif text-[12px] tracking-[0.18em] text-rose uppercase transition-colors hover:text-rose-soft"
        >
          {action.label} →
        </Link>
      ) : null}
    </div>
  );
}
