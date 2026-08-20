import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTags, tagSlug } from "@/lib/content";
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
  return { title: t(locale).topics, alternates: { canonical: `/${locale}/topics` } };
}

export default async function TopicsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = t(locale);
  const tags = getTags(locale);

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">{copy.topics}</h1>

      {tags.length === 0 ? (
        <p className="mt-6" style={{ color: "var(--fg-muted)" }}>
          {copy.noLessonsYet}
        </p>
      ) : (
        <ul className="mt-8 flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={`/${locale}/topics/${tagSlug(tag)}`}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:opacity-75"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
              >
                {tag}
                <span className="text-xs tabular-nums" style={{ color: "var(--fg-muted)" }}>
                  {count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
