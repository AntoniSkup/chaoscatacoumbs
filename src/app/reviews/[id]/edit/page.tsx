import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ReviewForm } from "@/components/ReviewForm";
import { isAuthenticated } from "@/lib/auth";
import { getReview } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function EditReviewPage({
  params,
}: PageProps<"/reviews/[id]/edit">) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const { id } = await params;
  const review = await getReview(id);

  if (!review) {
    notFound();
  }

  return (
    <>
      <Header authenticated />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <Link
          href={`/reviews/${review.id}`}
          className="font-serif text-[12px] tracking-[0.18em] text-ink-muted uppercase hover:text-rose"
        >
          ← Back to review
        </Link>

        <div className="mt-6 border border-line bg-bg-elevated/40 px-5 py-6 md:px-8 md:py-8">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
            <h1 className="font-serif text-lg tracking-[0.2em] text-ink uppercase">
              I Read...
            </h1>
            <p className="font-script text-2xl text-rose">a revision</p>
          </div>

          <ReviewForm review={review} />
        </div>
      </main>

      <Footer />
    </>
  );
}
