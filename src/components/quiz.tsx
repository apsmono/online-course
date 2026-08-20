"use client";

import { useMemo, useState } from "react";
import { type Locale, t } from "@/lib/i18n";

export type QuizChoice = {
  /** Answer text shown to the reader. */
  text: string;
  correct?: boolean;
  /** Shown after checking, whether or not this choice was picked. */
  explanation?: string;
};

export type QuizProps = {
  question: string;
  choices: QuizChoice[];
  locale?: Locale;
  /** Allow more than one correct answer. Inferred when several choices are correct. */
  multiple?: boolean;
};

/**
 * Self-contained comprehension check for use inside MDX. State lives in memory
 * only — nothing is persisted, which matches the no-accounts scope of v1.
 */
export function Quiz({ question, choices, locale = "id", multiple }: QuizProps) {
  const copy = t(locale);
  const correctIndexes = useMemo(
    () => new Set(choices.map((c, i) => (c.correct ? i : -1)).filter((i) => i >= 0)),
    [choices],
  );
  const isMultiple = multiple ?? correctIndexes.size > 1;

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  const isCorrect =
    checked &&
    selected.size === correctIndexes.size &&
    [...selected].every((i) => correctIndexes.has(i));

  function toggle(index: number) {
    if (checked) return;
    setSelected((previous) => {
      if (!isMultiple) return new Set([index]);
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function reset() {
    setSelected(new Set());
    setChecked(false);
  }

  return (
    <section
      className="not-prose my-8 rounded-xl border p-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
      aria-label={question}
    >
      <p className="mb-4 text-base font-semibold" style={{ color: "var(--fg)" }}>
        {question}
      </p>

      <ul className="flex flex-col gap-2">
        {choices.map((choice, index) => {
          const picked = selected.has(index);
          const reveal = checked && (picked || correctIndexes.has(index));
          const good = correctIndexes.has(index);

          return (
            <li key={choice.text}>
              <button
                type="button"
                onClick={() => toggle(index)}
                disabled={checked}
                aria-pressed={picked}
                className="flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-[0.95rem] transition-colors disabled:cursor-default"
                style={{
                  borderColor: reveal
                    ? good
                      ? "#16a34a"
                      : "#dc2626"
                    : picked
                      ? "var(--accent)"
                      : "var(--border)",
                  backgroundColor: picked && !checked ? "var(--accent-soft)" : "transparent",
                }}
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-xs font-semibold"
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: isMultiple ? "4px" : "999px",
                    backgroundColor: picked ? "var(--accent)" : "transparent",
                    color: picked ? "#fff" : "var(--fg-muted)",
                  }}
                >
                  {picked ? "✓" : String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">
                  <span style={{ color: "var(--fg)" }}>{choice.text}</span>
                  {reveal && choice.explanation ? (
                    <span className="mt-1 block text-sm" style={{ color: "var(--fg-muted)" }}>
                      {choice.explanation}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {checked ? (
          <>
            <span
              className="rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                backgroundColor: isCorrect ? "#16a34a1f" : "#dc26261f",
                color: isCorrect ? "#15803d" : "#b91c1c",
              }}
              role="status"
            >
              {isCorrect ? copy.quizCorrect : copy.quizWrong}
            </span>
            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium underline underline-offset-4"
              style={{ color: "var(--accent)" }}
            >
              {copy.quizRetry}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={selected.size === 0}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "var(--color-brand-600)" }}
          >
            {copy.quizCheck}
          </button>
        )}
      </div>
    </section>
  );
}

export default Quiz;
