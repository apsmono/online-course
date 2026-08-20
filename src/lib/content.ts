import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import GithubSlugger from "github-slugger";
import { type Level, type Locale, levels, locales } from "./i18n";

export const CONTENT_ROOT = path.join(process.cwd(), "content");

/**
 * Content model
 * -------------
 * Lessons are standalone files with a globally unique slug per locale:
 *   content/<locale>/lessons/<slug>.mdx
 *
 * Modules are ordered manifests that reference lesson slugs:
 *   content/<locale>/modules/<module>.json
 *
 * The relationship is many-to-many: a lesson may be listed by any number of
 * modules, and its canonical URL (/<locale>/lessons/<slug>) never changes as a
 * result. Sequential navigation uses the lesson's *primary* module — the one
 * named in frontmatter, or failing that the lowest-ordered module listing it.
 */

export type ModuleMeta = {
  slug: string;
  locale: Locale;
  title: string;
  description: string;
  level: Level;
  order: number;
  /** Lesson slugs in teaching order, exactly as written in the manifest. */
  lessonSlugs: string[];
  /** Outlined but unwritten lessons. Shown as a roadmap; never routed. */
  plannedLessons: PlannedLesson[];
};

export type PlannedLesson = { slug: string; title: string; level: Level };

export type LessonMeta = {
  slug: string;
  locale: Locale;
  title: string;
  summary: string;
  level: Level;
  tags: string[];
  updated: string | null;
  minutes: number;
  href: string;
  /** Module named in frontmatter as `primaryModule`, if any. */
  declaredPrimaryModule: string | null;
};

export type Lesson = LessonMeta & { body: string };

export type Heading = { depth: number; text: string; id: string };

export type TagEntry = { key: string; group: string; label: string };

const MDX_RE = /\.mdx?$/;

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

function asPlannedLessons(value: unknown): PlannedLesson[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.slug !== "string" || typeof record.title !== "string") return [];
    return [{ slug: record.slug, title: record.title, level: asLevel(record.level) }];
  });
}

/* -------------------------------------------------------------------------- */
/* Tag registry                                                               */
/* -------------------------------------------------------------------------- */

type TagRegistry = {
  tags: Record<string, { group: string } & Record<string, string>>;
  groups: Record<string, Record<string, string>>;
};

let tagRegistryCache: TagRegistry | null = null;

export function getTagRegistry(): TagRegistry {
  if (!tagRegistryCache) {
    const raw = fs.readFileSync(path.join(CONTENT_ROOT, "tags.json"), "utf8");
    const parsed = JSON.parse(raw) as TagRegistry;
    tagRegistryCache = { tags: parsed.tags ?? {}, groups: parsed.groups ?? {} };
  }
  return tagRegistryCache;
}

/** Display label for a tag key. Unknown keys fall back to the key itself. */
export function tagLabel(locale: Locale, key: string): string {
  return getTagRegistry().tags[key]?.[locale] ?? key;
}

export function tagGroup(key: string): string {
  return getTagRegistry().tags[key]?.group ?? "other";
}

export function groupLabel(locale: Locale, group: string): string {
  return getTagRegistry().groups[group]?.[locale] ?? group;
}

/* -------------------------------------------------------------------------- */
/* Lessons                                                                     */
/* -------------------------------------------------------------------------- */

const lessonCache = new Map<Locale, Map<string, Lesson>>();

function loadLessons(locale: Locale): Map<string, Lesson> {
  const cached = lessonCache.get(locale);
  if (cached) return cached;

  const dir = path.join(CONTENT_ROOT, locale, "lessons");
  const lessons = new Map<string, Lesson>();

  for (const entry of readDirSafe(dir)) {
    if (!entry.isFile() || !MDX_RE.test(entry.name)) continue;

    const slug = entry.name.replace(MDX_RE, "");
    const { data, content } = matter(fs.readFileSync(path.join(dir, entry.name), "utf8"));
    if (data.draft === true) continue;

    lessons.set(slug, {
      slug,
      locale,
      title: typeof data.title === "string" ? data.title : slug,
      summary: typeof data.summary === "string" ? data.summary : "",
      level: asLevel(data.level),
      tags: asStringArray(data.tags),
      updated: typeof data.updated === "string" ? data.updated : null,
      minutes: Math.max(1, Math.round(readingTime(content).minutes)),
      href: `/${locale}/lessons/${slug}`,
      declaredPrimaryModule:
        typeof data.primaryModule === "string" ? data.primaryModule : null,
      body: content,
    });
  }

  lessonCache.set(locale, lessons);
  return lessons;
}

function stripBody(lesson: Lesson): LessonMeta {
  const { body, ...meta } = lesson;
  void body;
  return meta;
}

export function getLesson(locale: Locale, slug: string): Lesson | null {
  return loadLessons(locale).get(slug) ?? null;
}

export function getAllLessons(locale: Locale): LessonMeta[] {
  return [...loadLessons(locale).values()]
    .map(stripBody)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getAllLessonParams(): { locale: Locale; lesson: string }[] {
  return locales.flatMap((locale) =>
    [...loadLessons(locale).keys()].map((lesson) => ({ locale, lesson })),
  );
}

/* -------------------------------------------------------------------------- */
/* Modules                                                                     */
/* -------------------------------------------------------------------------- */

const moduleCache = new Map<Locale, ModuleMeta[]>();

export function getModules(locale: Locale): ModuleMeta[] {
  const cached = moduleCache.get(locale);
  if (cached) return cached;

  const dir = path.join(CONTENT_ROOT, locale, "modules");
  const modules = readDirSafe(dir)
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map<ModuleMeta>((entry) => {
      const slug = entry.name.replace(/\.json$/, "");
      let raw: Record<string, unknown> = {};
      try {
        raw = JSON.parse(fs.readFileSync(path.join(dir, entry.name), "utf8")) as Record<
          string,
          unknown
        >;
      } catch {
        raw = {};
      }
      return {
        slug,
        locale,
        title: typeof raw.title === "string" ? raw.title : slug,
        description: typeof raw.description === "string" ? raw.description : "",
        level: asLevel(raw.level),
        order: typeof raw.order === "number" ? raw.order : Number.MAX_SAFE_INTEGER,
        lessonSlugs: asStringArray(raw.lessons),
        plannedLessons: asPlannedLessons(raw.plannedLessons),
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  moduleCache.set(locale, modules);
  return modules;
}

export function getModule(locale: Locale, slug: string): ModuleMeta | null {
  return getModules(locale).find((entry) => entry.slug === slug) ?? null;
}

/** Lessons of a module, in manifest order. Missing or draft slugs are skipped. */
export function getModuleLessons(locale: Locale, slug: string): LessonMeta[] {
  const found = getModule(locale, slug);
  if (!found) return [];
  const lessons = loadLessons(locale);
  return found.lessonSlugs
    .map((lessonSlug) => lessons.get(lessonSlug))
    .filter((lesson): lesson is Lesson => lesson !== undefined)
    .map(stripBody);
}

/** Every module that lists this lesson, lowest `order` first. */
export function getModulesForLesson(locale: Locale, slug: string): ModuleMeta[] {
  return getModules(locale).filter((entry) => entry.lessonSlugs.includes(slug));
}

/**
 * The module used for sequential navigation. Frontmatter `primaryModule` wins;
 * otherwise the lowest-ordered module that lists the lesson.
 */
export function getPrimaryModule(locale: Locale, slug: string): ModuleMeta | null {
  const owners = getModulesForLesson(locale, slug);
  if (owners.length === 0) return null;

  const declared = loadLessons(locale).get(slug)?.declaredPrimaryModule;
  if (declared) {
    const match = owners.find((entry) => entry.slug === declared);
    if (match) return match;
  }
  return owners[0];
}

export function getAdjacentLessons(
  locale: Locale,
  slug: string,
): { module: ModuleMeta | null; previous: LessonMeta | null; next: LessonMeta | null } {
  const primary = getPrimaryModule(locale, slug);
  if (!primary) return { module: null, previous: null, next: null };

  const siblings = getModuleLessons(locale, primary.slug);
  const index = siblings.findIndex((lesson) => lesson.slug === slug);
  return {
    module: primary,
    previous: index > 0 ? siblings[index - 1] : null,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
  };
}

/** Lessons not referenced by any module — surfaced by `npm run check:content`. */
export function getOrphanLessons(locale: Locale): LessonMeta[] {
  const claimed = new Set(getModules(locale).flatMap((entry) => entry.lessonSlugs));
  return getAllLessons(locale).filter((lesson) => !claimed.has(lesson.slug));
}

/* -------------------------------------------------------------------------- */
/* Tags                                                                        */
/* -------------------------------------------------------------------------- */

export function getTags(locale: Locale): (TagEntry & { count: number })[] {
  const counts = new Map<string, number>();
  for (const lesson of getAllLessons(locale)) {
    for (const key of lesson.tags) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      count,
      group: tagGroup(key),
      label: tagLabel(locale, key),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getLessonsByTag(locale: Locale, key: string): LessonMeta[] {
  return getAllLessons(locale).filter((lesson) => lesson.tags.includes(key));
}

/* -------------------------------------------------------------------------- */
/* Headings and search                                                         */
/* -------------------------------------------------------------------------- */

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
  modules: string[];
  moduleTitles: string;
  level: Level;
  tags: string[];
  tagLabels: string;
  text: string;
  href: string;
};

/** Plain-text search index consumed by the client-side search page. */
export function getSearchIndex(locale: Locale): SearchDoc[] {
  return [...loadLessons(locale).values()].map((lesson) => {
    const owners = getModulesForLesson(locale, lesson.slug);
    return {
      id: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      modules: owners.map((entry) => entry.slug),
      moduleTitles: owners.map((entry) => entry.title).join(" · "),
      level: lesson.level,
      tags: lesson.tags,
      tagLabels: lesson.tags.map((key) => tagLabel(locale, key)).join(" "),
      text: stripMarkdown(lesson.body).slice(0, 4000),
      href: lesson.href,
    };
  });
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
