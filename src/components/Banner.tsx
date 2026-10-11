import Image from "next/image";

export function Banner() {
  return (
    <section>
      <Image
        src="/banner.jpg"
        alt="Chaos's Catacombs — book reviews for the chaotic romantics"
        width={1024}
        height={341}
        loading="eager"
        fetchPriority="high"
        quality={95}
        sizes="(min-width: 1024px) 1024px, 100vw"
        className="animate-fade-up mx-auto h-auto w-full max-w-5xl"
      />
    </section>
  );
}
