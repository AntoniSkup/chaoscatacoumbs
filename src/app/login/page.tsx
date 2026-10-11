import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LoginForm } from "@/components/LoginForm";
import { Logo } from "@/components/Logo";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <>
      <Header authenticated={false} />

      <main className="flex flex-1 items-center px-6 py-16">
        <div className="mx-auto w-full max-w-xl border border-line bg-bg-elevated/50 px-6 py-12 md:px-10">
          <div className="mb-10 text-center">
            <p className="font-serif text-[12px] tracking-[0.32em] text-rose uppercase">
              Members only
            </p>
            <h1 className="mt-4 flex justify-center">
              <Logo className="h-auto w-full max-w-sm" />
            </h1>
            <p className="mt-4 text-sm text-ink-muted">
              Sign in to publish book reviews scored out of six stars.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center">
            <Link
              href="/"
              className="font-serif text-[12px] tracking-[0.18em] text-ink-muted uppercase hover:text-rose"
            >
              ← Back home
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
