import Image from "next/image";
import Link from "next/link";

type Panel = {
  src: string;
  alt: string;
};

type AboutSectionProps = {
  leftPanel?: Panel;
  rightPanel?: Panel;
};

const panelFrame =
  "relative min-h-56 overflow-hidden border border-line/50 lg:min-h-64";

function PanelBackdrop({
  panel,
  fallback,
}: {
  panel?: Panel;
  fallback: string;
}) {
  if (panel) {
    return (
      <Image
        src={panel.src}
        alt={panel.alt}
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover"
      />
    );
  }

  return (
    <>
      <div className={`absolute inset-0 ${fallback}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_70%,rgba(212,165,168,0.22),transparent_65%)]" />
    </>
  );
}

export function AboutSection({ leftPanel, rightPanel }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="grid gap-5 border border-line bg-bg-elevated/40 p-5 lg:grid-cols-[1fr_1.1fr_1fr]"
    >
      <div className={`${panelFrame} hidden lg:block`}>
        <PanelBackdrop
          panel={leftPanel}
          fallback="bg-[linear-gradient(160deg,#2a1a20,#0b0708)]"
        />
      </div>

      <div className="flex flex-col justify-center px-2 py-4">
        <h2 className="border-b border-line pb-3 font-serif text-xs tracking-[0.24em] text-ink uppercase">
          About Me
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/90">
          <p>
            Just a girl who loves books, dark romance, thrillers, fantasy, and
            all the in-between.
          </p>
          <p>
            I started this vault because I wanted a space to share my thoughts,
            my love for books, and maybe help someone find their next favorite
            read.
          </p>
          <p>
            Here you&apos;ll find honest reviews scored out of six stars, random
            bookish thoughts, and a mix of romance, fantasy, thrillers and
            everything in between.
          </p>
        </div>
        <Link
          href="/about"
          className="mt-5 inline-block self-start border border-line-strong px-4 py-2 font-serif text-[11px] tracking-[0.18em] text-rose uppercase transition-colors hover:bg-rose/10"
        >
          Learn more →
        </Link>
      </div>

      <div className={`${panelFrame} flex items-center justify-center px-6`}>
        <PanelBackdrop
          panel={rightPanel}
          fallback="bg-[linear-gradient(200deg,#2a1a20,#0b0708)]"
        />
        {/* The artwork carries its own lettering, so only the plain
            gradient needs the line rendered as text. */}
        {rightPanel ? null : (
          <p className="relative text-center font-script text-2xl leading-tight text-rose-soft">
            same girl... new books, bigger dreams ♡
          </p>
        )}
      </div>
    </section>
  );
}
