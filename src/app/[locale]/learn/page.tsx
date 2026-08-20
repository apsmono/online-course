import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonCard } from "@/components/lesson-card";
import { LevelBadge } from "@/components/level-badge";
import { getModuleLessons, getModules } from "@/lib/content";
import { isLocale, locales, t } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: t(locale).allModules, alternates: { canonical: `/${locale}/learn` } };
}

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = t(locale);
  const modules = getModules(locale);

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">{copy.allModules}</h1>

      {modules.length === 0 ? (
        <p className="mt-6" style={{ color: "var(--fg-muted)" }}>
          {copy.noLessonsYet}
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-12">
          {modules.map((entry) => {
            const lessons = getModuleLessons(locale, entry.slug);
            return (
              <section key={entry.slug}>
                <div className="mb-4 flex flex-wrap items-baseline gap-3">
                  <Link
                    href={`/${locale}/learn/${entry.slug}`}
                    className="text-xl font-semibold hover:underline"
                  >
                    {entry.title}
                  </Link>
                  <LevelBadge level={entry.level} locale={locale} />
                  <span className="text-sm" style={{ color: "var(--fg-muted)" }}>
                    {lessons.length} {copy.lessons}
                  </span>
                </div>
                <p className="mb-5 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  {entry.description}
                </p>
                <ul className="flex flex-col gap-3">
                  {lessons.map((lesson, index) => (
                    <LessonCard key={lesson.slug} lesson={lesson} locale={locale} index={index} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
