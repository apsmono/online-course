import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonCard } from "@/components/lesson-card";
import { getLessonsByTag, getTags, tagLabel } from "@/lib/content";
import { isLocale, locales, t } from "@/lib/i18n";

type Params = Promise<{ locale: string; tag: string }>;

export function generateStaticParams() {
  return locales.flatMap((locale) => getTags(locale).map(({ key }) => ({ locale, tag: key })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, tag } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${t(locale).taggedWith}: ${tagLabel(locale, tag)}`,
    alternates: {
      canonical: `/${locale}/topics/${tag}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/topics/${tag}`])),
    },
  };
}

export default async function TagPage({ params }: { params: Params }) {
  const { locale, tag } = await params;
  if (!isLocale(locale)) notFound();

  const lessons = getLessonsByTag(locale, tag);
  if (lessons.length === 0) notFound();

  const copy = t(locale);

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Link
        href={`/${locale}/topics`}
        className="text-sm hover:underline"
        style={{ color: "var(--fg-muted)" }}
      >
        ← {copy.topics}
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        {copy.taggedWith}: {tagLabel(locale, tag)}
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
        {lessons.length} {copy.lessons}
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.slug} lesson={lesson} locale={locale} />
        ))}
      </ul>
    </div>
  );
}
