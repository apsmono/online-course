import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonCard } from "@/components/lesson-card";
import { LevelBadge } from "@/components/level-badge";
import { getModule, getModuleLessons, getModules } from "@/lib/content";
import { isLocale, locales, t } from "@/lib/i18n";

type Params = Promise<{ locale: string; module: string }>;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getModules(locale).map((entry) => ({ locale, module: entry.slug })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, module: moduleSlug } = await params;
  if (!isLocale(locale)) return {};
  const found = getModule(locale, moduleSlug);
  if (!found) return {};

  return {
    title: found.title,
    description: found.description,
    alternates: {
      canonical: `/${locale}/learn/${found.slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/learn/${found.slug}`])),
    },
    openGraph: { title: found.title, description: found.description },
  };
}

export default async function ModulePage({ params }: { params: Params }) {
  const { locale, module: moduleSlug } = await params;
  if (!isLocale(locale)) notFound();

  const current = getModule(locale, moduleSlug);
  if (!current) notFound();

  const copy = t(locale);
  const lessons = getModuleLessons(locale, current.slug);

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Link
        href={`/${locale}/learn`}
        className="text-sm hover:underline"
        style={{ color: "var(--fg-muted)" }}
      >
        ← {copy.allModules}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{current.title}</h1>
        <LevelBadge level={current.level} locale={locale} />
      </div>
      <p className="mt-3 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        {current.description}
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

      {current.plannedLessons.length > 0 ? (
        <section className="mt-12">
          <h2
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--fg-muted)" }}
          >
            {copy.planned}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
            {copy.plannedNote}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {current.plannedLessons.map((planned, index) => (
              <li
                key={planned.slug}
                className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                <span aria-hidden className="w-6 shrink-0 font-semibold tabular-nums">
                  {String(lessons.length + index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{planned.title}</span>
                <LevelBadge level={planned.level} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
