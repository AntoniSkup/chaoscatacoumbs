import type { CurrentlyReading as CurrentlyReadingData } from "@/lib/reviews";
import { BookCover } from "./BookCover";
import { CurrentlyReadingForm } from "./CurrentlyReadingForm";

type CurrentlyReadingProps = {
  data: CurrentlyReadingData;
  canEdit?: boolean;
};

export function CurrentlyReading({
  data,
  canEdit = false,
}: CurrentlyReadingProps) {
  return (
    <section
      id="currently-reading"
      className="border border-line bg-bg-elevated/40 p-5"
    >
      <h2 className="border-b border-line pb-3 font-serif text-xs tracking-[0.24em] text-ink uppercase">
        Currently Reading
      </h2>

      <div className="mt-4 flex gap-4">
        <div className="w-24 shrink-0">
          <BookCover
            title={data.title}
            author={data.author}
            coverId={data.coverId}
            size="sm"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-serif text-sm tracking-wide text-ink">
            {data.title}
          </h3>
          <p className="text-xs text-ink-muted">{data.author}</p>

          <div className="mt-4 flex items-center gap-2">
            <div
              className="h-2 flex-1 border border-line/60 bg-bg"
              role="progressbar"
              aria-valuenow={data.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Reading progress"
            >
              <div
                className="h-full bg-gradient-to-r from-rose-deep to-rose-soft"
                style={{ width: `${data.progress}%` }}
              />
            </div>
            <span className="text-xs text-ink-muted">{data.progress}%</span>
          </div>

          <p className="mt-3 font-script text-lg leading-tight text-rose">
            {data.note}
          </p>
        </div>
      </div>

      {canEdit ? <CurrentlyReadingForm data={data} /> : null}
    </section>
  );
}
