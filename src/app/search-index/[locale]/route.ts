import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/content";
import { type Locale, isLocale, locales } from "@/lib/i18n";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Unknown locale" }, { status: 404 });
  }
  return NextResponse.json(getSearchIndex(locale as Locale));
}
