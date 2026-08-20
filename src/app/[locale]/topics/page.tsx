import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTags, groupLabel } from "@/lib/content";
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

  // Group the registry's tags so the page reads as a taxonomy, not a word cloud.
  const grouped = new Map<string, typeof tags>();
  for (const tag of tags) {
    const bucket = grouped.get(tag.group) ?? [];
    bucket.push(tag);
    grouped.set(tag.group, bucket);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">{copy.topics}</h1>

      {tags.length === 0 ? (
        <p className="mt-6" style={{ color: "var(--fg-muted)" }}>
          {copy.noLessonsYet}
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {[...grouped.entries()].map(([group, entries]) => (
            <section key={group}>
              <h2
                className="mb-4 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--fg-muted)" }}
              >
                {groupLabel(locale, group)}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {entries.map((tag) => (
                  <li key={tag.key}>
                    <Link
                      href={`/${locale}/topics/${tag.key}`}
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:opacity-75"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--bg-elevated)",
                      }}
                    >
                      {tag.label}
                      <span className="text-xs tabular-nums" style={{ color: "var(--fg-muted)" }}>
                        {tag.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
