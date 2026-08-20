import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, locales, t } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import "../globals.css";

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
  const copy = t(locale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: `${copy.siteName} — ${copy.tagline}`, template: `%s · ${copy.siteName}` },
    description: copy.heroBody,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: copy.siteName,
      locale: locale === "id" ? "id_ID" : "en_US",
      title: `${copy.siteName} — ${copy.tagline}`,
      description: copy.heroBody,
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:px-3 focus:py-2"
          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--fg)" }}
        >
          Skip to content
        </a>
        <SiteHeader locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
