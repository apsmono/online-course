import Link from "next/link";
import { notFound } from "next/navigation";
import { LevelBadge } from "@/components/level-badge";
import { getAllLessons, getLessons, getTracks } from "@/lib/content";
import { isLocale, t } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = t(locale);
  const tracks = getTracks(locale);
  const lessonCount = getAllLessons(locale).length;

  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="py-16 sm:py-24">
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          {copy.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {copy.heroBody}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/learn`}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-brand-600)" }}
          >
            {copy.startLearning}
          </Link>
          <Link
            href={`/${locale}/search`}
            className="rounded-lg border px-5 py-2.5 text-sm font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--fg)" }}
          >
            {copy.search}
          </Link>
          <span className="text-sm" style={{ color: "var(--fg-muted)" }}>
            {tracks.length} {copy.tracks.toLowerCase()} · {lessonCount} {copy.lessons}
          </span>
        </div>
      </section>

      <section className="pb-16">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
          {copy.allTracks}
        </h2>

        {tracks.length === 0 ? (
          <p style={{ color: "var(--fg-muted)" }}>{copy.noLessonsYet}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => {
              const count = getLessons(locale, track.slug).length;
              return (
                <li key={track.slug}>
                  <Link
                    href={`/${locale}/learn/${track.slug}`}
                    className="group flex h-full flex-col rounded-xl border p-5 transition-colors"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg font-semibold group-hover:underline">{track.title}</span>
                      <LevelBadge level={track.level} locale={locale} />
                    </span>
                    <span className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                      {track.description}
                    </span>
                    <span className="mt-4 text-xs font-medium" style={{ color: "var(--fg-muted)" }}>
                      {count} {copy.lessons}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
