import type { ReactNode } from "react";

const TONES = {
  note: { border: "#3381fb", bg: "#3381fb14", icon: "i" },
  tip: { border: "#16a34a", bg: "#16a34a14", icon: "★" },
  warning: { border: "#d97706", bg: "#d9770614", icon: "!" },
} as const;

export type CalloutProps = {
  type?: keyof typeof TONES;
  title?: string;
  children: ReactNode;
};

export function Callout({ type = "note", title, children }: CalloutProps) {
  const tone = TONES[type] ?? TONES.note;

  return (
    <aside
      className="my-6 rounded-lg border-l-4 px-4 py-3"
      style={{ borderColor: tone.border, backgroundColor: tone.bg }}
    >
      {title ? (
        <p className="mb-1 flex items-center gap-2 font-semibold" style={{ color: "var(--fg)" }}>
          <span aria-hidden style={{ color: tone.border }}>
            {tone.icon}
          </span>
          {title}
        </p>
      ) : null}
      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{children}</div>
    </aside>
  );
}

export default Callout;
