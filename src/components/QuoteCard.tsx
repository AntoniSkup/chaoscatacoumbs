export function QuoteCard({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden border border-line bg-[linear-gradient(145deg,#1d1114,#0a0708)] px-6 py-10 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,165,168,0.2),transparent_65%)]" />
      <p className="relative font-script text-3xl leading-tight text-rose-soft">
        {text}
      </p>
    </div>
  );
}
