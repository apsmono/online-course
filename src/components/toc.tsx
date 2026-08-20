"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content";

/** Sidebar table of contents with a scroll-spy highlight. */
export function Toc({ headings, label }: { headings: Heading[]; label: string }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label={label} className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
        {label}
      </p>
      <ul className="flex flex-col gap-1.5 border-l" style={{ borderColor: "var(--border)" }}>
        {headings.map((heading) => {
          const active = heading.id === activeId;
          return (
            <li key={heading.id} style={{ paddingLeft: heading.depth === 3 ? "1.5rem" : "0.75rem" }}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? "location" : undefined}
                className="block py-0.5 leading-snug transition-colors hover:opacity-80"
                style={{
                  color: active ? "var(--accent)" : "var(--fg-muted)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
