import Link from "next/link";
import { defaultLocale, t } from "@/lib/i18n";
import "./globals.css";

/** Top-level fallback: renders its own document since the root layout is a pass-through. */
export default function GlobalNotFound() {
  const copy = t(defaultLocale);

  return (
    <html lang={defaultLocale}>
      <body>
        <div className="mx-auto flex max-w-xl flex-col items-start px-5 py-28">
          <p className="text-sm font-semibold" style={{ color: "var(--fg-muted)" }}>
            404
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{copy.notFound}</h1>
          <p className="mt-3" style={{ color: "var(--fg-muted)" }}>
            {copy.notFoundBody}
          </p>
          <Link
            href={`/${defaultLocale}`}
            className="mt-8 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-brand-600)" }}
          >
            {copy.goHome}
          </Link>
        </div>
      </body>
    </html>
  );
}
