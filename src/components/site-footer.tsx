import Link from "next/link";
import { type Locale, t } from "@/lib/i18n";
import { RELEASE_LABEL } from "@/lib/version";

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = t(locale);

  return (
    <footer className="mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div
        className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm sm:flex-row sm:items-center sm:justify-between"
        style={{ color: "var(--fg-muted)" }}
      >
        <p>{copy.footerNote}</p>
        <div className="flex gap-5">
          <Link href={`/${locale}/learn`} className="hover:opacity-70">
            {copy.modules}
          </Link>
          <Link href={`/${locale}/topics`} className="hover:opacity-70">
            {copy.topics}
          </Link>
          <span>© {new Date().getFullYear()} apsmono</span>
          <span title="Release stage — see docs/VERSIONING.md">{RELEASE_LABEL}</span>
        </div>
      </div>
    </footer>
  );
}
