import { type Level, type Locale, t } from "@/lib/i18n";

const TONE: Record<Level, { bg: string; fg: string }> = {
  basic: { bg: "#16a34a1f", fg: "#15803d" },
  intermediate: { bg: "#d977061f", fg: "#b45309" },
  advanced: { bg: "#dc26261f", fg: "#b91c1c" },
};

export function LevelBadge({ level, locale }: { level: Level; locale: Locale }) {
  const tone = TONE[level];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      {t(locale).levels[level]}
    </span>
  );
}
