import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LevelBadge } from "@/components/level-badge";
import { MdxContent } from "@/components/mdx";
import { Toc } from "@/components/toc";
import {
  getAdjacentLessons,
  getAllLessonParams,
  getHeadings,
  getLesson,
  getTrack,
  tagSlug,
} from "@/lib/content";
import { isLocale, locales, t } from "@/lib/i18n";

type Params = Promise<{ locale: string; track: string; lesson: string }>;

export function generateStaticParams() {
  return getAllLessonParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, track, lesson: lessonSlug } = await params;
  if (!isLocale(locale)) return {};
  const lesson = getLesson(locale, track, lessonSlug);
  if (!lesson) return {};

  const path = `/learn/${track}/${lessonSlug}`;
  return {
    title: lesson.title,
    description: lesson.summary,
    keywords: lesson.tags,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
    },
    openGraph: {
      type: "article",
      title: lesson.title,
      description: lesson.summary,
      modifiedTime: lesson.updated ?? undefined,
    },
  };
}

export default async function LessonPage({ params }: { params: Params }) {
  const { locale, track: trackSlug, lesson: lessonSlug } = await params;
  if (!isLocale(locale)) notFound();

  const lesson = getLesson(locale, trackSlug, lessonSlug);
  const track = getTrack(locale, trackSlug);
  if (!lesson || !track) notFound();

  const copy = t(locale);
  const headings = getHeadings(lesson.body);
  const { previous, next } = getAdjacentLessons(lesson);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
        <article className="min-w-0">
          <Link
            href={`/${locale}/learn/${track.slug}`}
            className="text-sm hover:underline"
            style={{ color: "var(--fg-muted)" }}
          >
            ← {track.title}
          </Link>

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {lesson.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--fg-muted)" }}>
            <LevelBadge level={lesson.level} locale={locale} />
            <span>
              {lesson.minutes} {copy.minRead}
            </span>
            {lesson.updated ? (
              <span>
                {copy.updated}{" "}
                <time dateTime={lesson.updated}>
                  {new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
                    dateStyle: "medium",
                  }).format(new Date(lesson.updated))}
                </time>
              </span>
            ) : null}
          </div>

          {lesson.summary ? (
            <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {lesson.summary}
            </p>
          ) : null}

          <div className="prose mt-10">
            <MdxContent source={lesson.body} locale={locale} />
          </div>

          {lesson.tags.length ? (
            <div className="mt-12 flex flex-wrap gap-2">
              {lesson.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/${locale}/topics/${tagSlug(tag)}`}
                  className="rounded-full border px-3 py-1 text-xs font-medium hover:opacity-70"
                  style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}

          <nav className="mt-12 grid gap-3 border-t pt-8 sm:grid-cols-2" style={{ borderColor: "var(--border)" }}>
            {previous ? (
              <Link
                href={previous.href}
                className="rounded-xl border p-4 hover:opacity-80"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
                  ← {copy.previous}
                </span>
                <span className="mt-1 block font-medium">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={next.href}
                className="rounded-xl border p-4 text-right hover:opacity-80"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
                  {copy.next} →
                </span>
                <span className="mt-1 block font-medium">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Toc headings={headings} label={copy.onThisPage} />
          </div>
        </aside>
      </div>
    </div>
  );
}
