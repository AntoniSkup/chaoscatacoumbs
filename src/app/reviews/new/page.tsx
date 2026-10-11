import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ReviewForm } from "@/components/ReviewForm";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewReviewPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return (
    <>
      <Header authenticated />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <Link
          href="/reviews"
          className="font-serif text-[12px] tracking-[0.18em] text-ink-muted uppercase hover:text-rose"
        >
          ← Back to all reviews
        </Link>

        <div className="mt-6 border border-line bg-bg-elevated/40 px-5 py-6 md:px-8 md:py-8">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
            <h1 className="font-serif text-lg tracking-[0.2em] text-ink uppercase">
              I Read...
            </h1>
            <p className="font-script text-2xl text-rose">new entry</p>
          </div>

          <ReviewForm />
        </div>
      </main>

      <Footer />
    </>
  );
}
