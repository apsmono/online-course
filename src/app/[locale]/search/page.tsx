import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Search } from "@/components/search";
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
  return {
    title: t(locale).search,
    alternates: { canonical: `/${locale}/search` },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = t(locale);

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{copy.search}</h1>
      <Search locale={locale} />
    </div>
  );
}
