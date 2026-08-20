"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale, locales } from "@/lib/i18n";

/**
 * Swaps only the leading locale segment so the reader stays on the same page
 * when a translation exists at the mirrored path.
 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? `/${current}`;

  return (
    <div
      className="flex items-center rounded-full border p-0.5 text-xs font-semibold"
      style={{ borderColor: "var(--border)" }}
      aria-label="Language"
    >
      {locales.map((locale) => {
        const segments = pathname.split("/");
        segments[1] = locale;
        const href = segments.join("/") || `/${locale}`;
        const active = locale === current;

        return (
          <Link
            key={locale}
            href={href}
            hrefLang={locale}
            aria-current={active ? "true" : undefined}
            className="rounded-full px-2.5 py-1 uppercase transition-colors"
            style={{
              backgroundColor: active ? "var(--accent-soft)" : "transparent",
              color: active ? "var(--accent)" : "var(--fg-muted)",
            }}
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
