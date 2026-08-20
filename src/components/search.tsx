"use client";

import Link from "next/link";
import MiniSearch, { type SearchResult } from "minisearch";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchDoc } from "@/lib/content";
import { type Locale, t } from "@/lib/i18n";
import { LevelBadge } from "./level-badge";

type Hit = SearchResult & SearchDoc;

/** Client-side full-text search over a statically generated index. */
export function Search({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/search-index/${locale}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data: SearchDoc[]) => {
        if (!cancelled) setDocs(data);
      })
      .catch(() => {
        if (!cancelled) setDocs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const index = useMemo(() => {
    if (!docs) return null;
    const engine = new MiniSearch<SearchDoc>({
      fields: ["title", "summary", "text", "tags", "trackTitle"],
      storeFields: ["title", "summary", "href", "trackTitle", "level", "tags"],
      searchOptions: {
        boost: { title: 4, summary: 2, tags: 2 },
        prefix: true,
        fuzzy: 0.2,
      },
    });
    engine.addAll(docs);
    return engine;
  }, [docs]);

  const results = useMemo<Hit[]>(() => {
    const term = query.trim();
    if (!index || term.length < 2) return [];
    return index.search(term).slice(0, 30) as Hit[];
  }, [index, query]);

  const term = query.trim();

  return (
    <div>
      <label htmlFor="search-input" className="sr-only">
        {copy.search}
      </label>
      <input
        id="search-input"
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={copy.searchPlaceholder}
        autoComplete="off"
        className="w-full rounded-xl border px-4 py-3 text-base outline-none"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-elevated)",
          color: "var(--fg)",
        }}
      />

      <div className="mt-6" aria-live="polite">
        {term.length < 2 ? (
          <p style={{ color: "var(--fg-muted)" }}>{copy.searchEmpty}</p>
        ) : results.length === 0 ? (
          <p style={{ color: "var(--fg-muted)" }}>{copy.searchNoResults}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {results.map((hit) => (
              <li key={hit.id}>
                <Link
                  href={hit.href}
                  className="block rounded-xl border p-4 transition-colors hover:opacity-90"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold" style={{ color: "var(--fg)" }}>
                      {hit.title}
                    </span>
                    <LevelBadge level={hit.level} locale={locale} />
                  </span>
                  <span className="mt-1 block text-sm" style={{ color: "var(--fg-muted)" }}>
                    {hit.trackTitle}
                    {hit.summary ? ` — ${hit.summary}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
