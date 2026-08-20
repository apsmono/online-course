import Link from "next/link";
import type { LessonMeta } from "@/lib/content";
import { type Locale, t } from "@/lib/i18n";
import { LevelBadge } from "./level-badge";

export function LessonCard({
  lesson,
  locale,
  index,
}: {
  lesson: LessonMeta;
  locale: Locale;
  index?: number;
}) {
  const copy = t(locale);

  return (
    <li>
      <Link
        href={lesson.href}
        className="group flex gap-4 rounded-xl border p-4 transition-colors"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
      >
        {typeof index === "number" ? (
          <span
            aria-hidden
            className="mt-0.5 w-6 shrink-0 text-sm font-semibold tabular-nums"
            style={{ color: "var(--fg-muted)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold group-hover:underline" style={{ color: "var(--fg)" }}>
              {lesson.title}
            </span>
            <LevelBadge level={lesson.level} locale={locale} />
          </span>
          {lesson.summary ? (
            <span className="mt-1 block text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {lesson.summary}
            </span>
          ) : null}
          <span className="mt-2 block text-xs" style={{ color: "var(--fg-muted)" }}>
            {lesson.minutes} {copy.minRead}
            {lesson.tags.length ? ` · ${lesson.tags.join(", ")}` : ""}
          </span>
        </span>
      </Link>
    </li>
  );
}
