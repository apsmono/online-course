import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import GithubSlugger from "github-slugger";
import { type Level, type Locale, levels, locales } from "./i18n";

export const CONTENT_ROOT = path.join(process.cwd(), "content");

export type TrackMeta = {
  slug: string;
  locale: Locale;
  title: string;
  description: string;
  level: Level;
  order: number;
};

export type LessonMeta = {
  slug: string;
  track: string;
  locale: Locale;
  title: string;
  summary: string;
  level: Level;
  tags: string[];
  order: number;
  updated: string | null;
  minutes: number;
  href: string;
};

export type Lesson = LessonMeta & { body: string };

export type Heading = { depth: number; text: string; id: string };

const MDX_RE = /\.mdx?$/;
const ORDER_PREFIX_RE = /^(\d+)[-_.]/;

function readDirSafe(dir: string): fs.Dirent[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function asLevel(value: unknown, fallback: Level = "basic"): Level {
  return typeof value === "string" && (levels as readonly string[]).includes(value)
    ? (value as Level)
    : fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

/** Turn "02-css-layout.mdx" into { order: 2, slug: "css-layout" }. */
function parseFileName(fileName: string): { order: number; slug: string } {
  const base = fileName.replace(MDX_RE, "");
  const match = ORDER_PREFIX_RE.exec(base);
  if (!match) return { order: Number.MAX_SAFE_INTEGER, slug: base };
  return { order: Number(match[1]), slug: base.slice(match[0].length) };
}

export function getTracks(locale: Locale): TrackMeta[] {
  const localeDir = path.join(CONTENT_ROOT, locale);
  const tracks = readDirSafe(localeDir)
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map<TrackMeta>((entry) => {
      const metaPath = path.join(localeDir, entry.name, "_track.json");
      let raw: Record<string, unknown> = {};
      try {
        raw = JSON.parse(fs.readFileSync(metaPath, "utf8")) as Record<string, unknown>;
      } catch {
        raw = {};
      }
      return {
        slug: entry.name,
        locale,
        title: typeof raw.title === "string" ? raw.title : entry.name,
        description: typeof raw.description === "string" ? raw.description : "",
        level: asLevel(raw.level),
        order: typeof raw.order === "number" ? raw.order : Number.MAX_SAFE_INTEGER,
      };
    });

  return tracks.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getTrack(locale: Locale, slug: string): TrackMeta | null {
  return getTracks(locale).find((track) => track.slug === slug) ?? null;
}

function readLessonFile(locale: Locale, track: string, fileName: string): Lesson | null {
  const filePath = path.join(CONTENT_ROOT, locale, track, fileName);
  let source: string;
  try {
    source = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const { data, content } = matter(source);
  if (data.draft === true) return null;

  const parsed = parseFileName(fileName);
  const slug = typeof data.slug === "string" ? data.slug : parsed.slug;
  const order = typeof data.order === "number" ? data.order : parsed.order;

  return {
    slug,
    track,
    locale,
    title: typeof data.title === "string" ? data.title : slug,
    summary: typeof data.summary === "string" ? data.summary : "",
    level: asLevel(data.level),
    tags: asStringArray(data.tags),
    order,
    updated: typeof data.updated === "string" ? data.updated : null,
    minutes: Math.max(1, Math.round(readingTime(content).minutes)),
    href: `/${locale}/learn/${track}/${slug}`,
    body: content,
  };
}

function stripBody(lesson: Lesson): LessonMeta {
  const { body, ...meta } = lesson;
  void body;
  return meta;
}

export function getLessons(locale: Locale, track: string): LessonMeta[] {
  const trackDir = path.join(CONTENT_ROOT, locale, track);
  return readDirSafe(trackDir)
    .filter((entry) => entry.isFile() && MDX_RE.test(entry.name))
    .map((entry) => readLessonFile(locale, track, entry.name))
    .filter((lesson): lesson is Lesson => lesson !== null)
    .map((lesson) => stripBody(lesson))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getLesson(locale: Locale, track: string, slug: string): Lesson | null {
  const trackDir = path.join(CONTENT_ROOT, locale, track);
  for (const entry of readDirSafe(trackDir)) {
    if (!entry.isFile() || !MDX_RE.test(entry.name)) continue;
    const lesson = readLessonFile(locale, track, entry.name);
    if (lesson?.slug === slug) return lesson;
  }
  return null;
}

export function getAllLessons(locale: Locale): LessonMeta[] {
  return getTracks(locale).flatMap((track) => getLessons(locale, track.slug));
}

export function getAllLessonParams(): { locale: Locale; track: string; lesson: string }[] {
  return locales.flatMap((locale) =>
    getAllLessons(locale).map((lesson) => ({
      locale,
      track: lesson.track,
      lesson: lesson.slug,
    })),
  );
}

export function getAdjacentLessons(lesson: LessonMeta): {
  previous: LessonMeta | null;
  next: LessonMeta | null;
} {
  const siblings = getLessons(lesson.locale, lesson.track);
  const index = siblings.findIndex((item) => item.slug === lesson.slug);
  return {
    previous: index > 0 ? siblings[index - 1] : null,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
  };
}

export function getTags(locale: Locale): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const lesson of getAllLessons(locale)) {
    for (const tag of lesson.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getLessonsByTag(locale: Locale, slug: string): LessonMeta[] {
  return getAllLessons(locale).filter((lesson) =>
    lesson.tags.some((tag) => tagSlug(tag) === slug),
  );
}

const HEADING_RE = /^(#{2,3})\s+(.+?)\s*$/gm;
const FENCE_RE = /^```[\s\S]*?^```$/gm;

/** Mirrors rehype-slug so TOC links resolve to the ids rendered in the MDX. */
export function slugifyHeading(text: string, slugger = new GithubSlugger()): string {
  return slugger.slug(text);
}

/** Extract h2/h3 headings for the table of contents, ignoring fenced code blocks. */
export function getHeadings(body: string): Heading[] {
  const withoutCode = body.replace(FENCE_RE, "");
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  for (const match of withoutCode.matchAll(HEADING_RE)) {
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();
    headings.push({ depth: match[1].length, text, id: slugger.slug(text) });
  }
  return headings;
}

export type SearchDoc = {
  id: string;
  title: string;
  summary: string;
  track: string;
  trackTitle: string;
  level: Level;
  tags: string[];
  text: string;
  href: string;
};

/** Plain-text search index for the client-side search page. */
export function getSearchIndex(locale: Locale): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const track of getTracks(locale)) {
    for (const meta of getLessons(locale, track.slug)) {
      const lesson = getLesson(locale, track.slug, meta.slug);
      docs.push({
        id: `${track.slug}/${meta.slug}`,
        title: meta.title,
        summary: meta.summary,
        track: track.slug,
        trackTitle: track.title,
        level: meta.level,
        tags: meta.tags,
        text: stripMarkdown(lesson?.body ?? "").slice(0, 4000),
        href: meta.href,
      });
    }
  }
  return docs;
}

function stripMarkdown(body: string): string {
  return body
    .replace(FENCE_RE, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
