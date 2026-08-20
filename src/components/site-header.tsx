import Link from "next/link";
import { type Locale, t } from "@/lib/i18n";
import { LocaleSwitcher } from "./locale-switcher";

export function SiteHeader({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const nav = [
    { href: `/${locale}/learn`, label: copy.modules },
    { href: `/${locale}/topics`, label: copy.topics },
    { href: `/${locale}/search`, label: copy.search },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "color-mix(in oklab, var(--bg) 85%, transparent)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link href={`/${locale}`} className="flex items-baseline gap-2 font-semibold tracking-tight">
          <span className="text-lg">{copy.siteName}</span>
          <span className="hidden text-xs font-normal sm:inline" style={{ color: "var(--fg-muted)" }}>
            {copy.tagline}
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-5 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium transition-colors hover:opacity-70"
              style={{ color: "var(--fg-muted)" }}
            >
              {item.label}
            </Link>
          ))}
          <LocaleSwitcher current={locale} />
        </nav>
      </div>
    </header>
  );
}
