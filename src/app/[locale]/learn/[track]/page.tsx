import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonCard } from "@/components/lesson-card";
import { LevelBadge } from "@/components/level-badge";
import { getLessons, getTrack, getTracks } from "@/lib/content";
import { isLocale, locales, t } from "@/lib/i18n";

type Params = Promise<{ locale: string; track: string }>;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getTracks(locale).map((track) => ({ locale, track: track.slug })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, track: trackSlug } = await params;
  if (!isLocale(locale)) return {};
  const track = getTrack(locale, trackSlug);
  if (!track) return {};

  return {
    title: track.title,
    description: track.description,
    alternates: {
      canonical: `/${locale}/learn/${track.slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/learn/${track.slug}`])),
    },
    openGraph: { title: track.title, description: track.description },
  };
}

export default async function TrackPage({ params }: { params: Params }) {
  const { locale, track: trackSlug } = await params;
  if (!isLocale(locale)) notFound();

  const track = getTrack(locale, trackSlug);
  if (!track) notFound();

  const copy = t(locale);
  const lessons = getLessons(locale, track.slug);

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Link href={`/${locale}/learn`} className="text-sm hover:underline" style={{ color: "var(--fg-muted)" }}>
        ← {copy.allTracks}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{track.title}</h1>
        <LevelBadge level={track.level} locale={locale} />
      </div>
      <p className="mt-3 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        {track.description}
      </p>

      {lessons.length === 0 ? (
        <p className="mt-10" style={{ color: "var(--fg-muted)" }}>
          {copy.noLessonsYet}
        </p>
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {lessons.map((lesson, index) => (
            <LessonCard key={lesson.slug} lesson={lesson} locale={locale} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}
