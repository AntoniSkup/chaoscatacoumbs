import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QuoteCard } from "@/components/QuoteCard";
import { SocialIcons } from "@/components/SocialIcons";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const authenticated = await isAuthenticated();

  return (
    <>
      <Header authenticated={authenticated} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_260px]">
          <div>
            <p className="font-script text-3xl text-rose">about me</p>
            <h1 className="mt-1 font-serif text-2xl tracking-[0.22em] text-ink uppercase">
              Chaos&apos;s Catacombs
            </h1>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/90">
              <p>
                Just a girl who loves books, dark romance, thrillers, fantasy,
                and all the in-between.
              </p>
              <p>
                I started this vault because I wanted a space to share my
                thoughts, my love for books, and maybe help someone find their
                next favorite read.
              </p>
              <p>
                Every review here is scored out of six stars — because
                occasionally a book deserves more than a perfect five.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="border-b border-line pb-2 font-serif text-xs tracking-[0.24em] text-ink uppercase">
                Follow Me
              </h2>
              <SocialIcons size={20} className="mt-4" />
            </div>
          </div>

          <aside>
            <QuoteCard text="good books, bad decisions" />
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
