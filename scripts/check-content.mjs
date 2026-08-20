#!/usr/bin/env node
/**
 * Content validator.
 *
 * Fails the build (exit 1) on anything that would render a broken page or a
 * dead link; prints warnings for things a human should look at but that do not
 * break the site — most often a translation that has not caught up yet.
 *
 * Run with: npm run check:content
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const LOCALES = ["id", "en"];
const LEVELS = ["basic", "intermediate", "advanced"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REQUIRED_FRONTMATTER = ["title", "summary", "level", "tags", "updated"];

const errors = [];
const warnings = [];

const fail = (where, message) => errors.push(`${where}: ${message}`);
const warn = (where, message) => warnings.push(`${where}: ${message}`);

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(path.relative(ROOT, file), `invalid JSON — ${error.message}`);
    return null;
  }
}

function listFiles(dir, extension) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

/* -- tag registry --------------------------------------------------------- */

const registry = readJson(path.join(CONTENT, "tags.json")) ?? { tags: {}, groups: {} };
const tagKeys = new Set(Object.keys(registry.tags ?? {}));

for (const [key, entry] of Object.entries(registry.tags ?? {})) {
  if (!SLUG_RE.test(key)) fail("tags.json", `tag key "${key}" is not lowercase kebab-case`);
  if (!entry.group) fail("tags.json", `tag "${key}" has no group`);
  else if (!registry.groups?.[entry.group]) {
    fail("tags.json", `tag "${key}" references unknown group "${entry.group}"`);
  }
  for (const locale of LOCALES) {
    if (!entry[locale]) fail("tags.json", `tag "${key}" has no "${locale}" label`);
  }
}

/* -- per-locale content --------------------------------------------------- */

const byLocale = {};

for (const locale of LOCALES) {
  const lessonsDir = path.join(CONTENT, locale, "lessons");
  const modulesDir = path.join(CONTENT, locale, "modules");

  const lessons = new Map();
  for (const file of listFiles(lessonsDir, ".mdx")) {
    const slug = file.replace(/\.mdx$/, "");
    const where = `${locale}/lessons/${file}`;

    if (!SLUG_RE.test(slug)) fail(where, `filename "${slug}" is not lowercase kebab-case`);

    const { data } = matter(fs.readFileSync(path.join(lessonsDir, file), "utf8"));

    for (const key of REQUIRED_FRONTMATTER) {
      if (data[key] === undefined || data[key] === "") fail(where, `missing frontmatter "${key}"`);
    }
    if (data.level && !LEVELS.includes(data.level)) {
      fail(where, `level "${data.level}" is not one of ${LEVELS.join(", ")}`);
    }
    if (data.updated && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.updated))) {
      fail(where, `updated "${data.updated}" is not YYYY-MM-DD (quote it in YAML)`);
    }

    const tags = Array.isArray(data.tags) ? data.tags : [];
    if (tags.length === 0) warn(where, "has no tags — it will not appear under any topic");
    for (const tag of tags) {
      if (!tagKeys.has(tag)) {
        fail(where, `tag "${tag}" is not in content/tags.json — add it there or fix the spelling`);
      }
    }
    if (new Set(tags).size !== tags.length) fail(where, "has duplicate tags");

    lessons.set(slug, { slug, tags, level: data.level, primaryModule: data.primaryModule ?? null, draft: data.draft === true });
  }

  const modules = new Map();
  for (const file of listFiles(modulesDir, ".json")) {
    const slug = file.replace(/\.json$/, "");
    const where = `${locale}/modules/${file}`;

    if (!SLUG_RE.test(slug)) fail(where, `filename "${slug}" is not lowercase kebab-case`);

    const raw = readJson(path.join(modulesDir, file));
    if (!raw) continue;

    for (const key of ["title", "description", "level", "order", "lessons"]) {
      if (raw[key] === undefined) fail(where, `missing key "${key}"`);
    }
    if (raw.level && !LEVELS.includes(raw.level)) {
      fail(where, `level "${raw.level}" is not one of ${LEVELS.join(", ")}`);
    }
    if (raw.order !== undefined && typeof raw.order !== "number") {
      fail(where, `"order" must be a number`);
    }

    const listed = Array.isArray(raw.lessons) ? raw.lessons : [];
    if (new Set(listed).size !== listed.length) fail(where, "lists the same lesson twice");
    for (const lessonSlug of listed) {
      if (!lessons.has(lessonSlug)) {
        fail(where, `lists "${lessonSlug}", which has no file at content/${locale}/lessons/${lessonSlug}.mdx`);
      }
    }

    const planned = Array.isArray(raw.plannedLessons) ? raw.plannedLessons : [];
    for (const entry of planned) {
      if (!entry?.slug || !entry?.title) {
        fail(where, "plannedLessons entries need both slug and title");
        continue;
      }
      if (lessons.has(entry.slug)) {
        fail(where, `"${entry.slug}" is written but still listed under plannedLessons — move it into "lessons"`);
      }
      if (entry.level && !LEVELS.includes(entry.level)) {
        fail(where, `planned lesson "${entry.slug}" has invalid level "${entry.level}"`);
      }
    }

    modules.set(slug, { slug, order: raw.order, listed, planned: planned.map((entry) => entry.slug) });
  }

  // Orphans and primary-module integrity.
  const claimed = new Set([...modules.values()].flatMap((module) => module.listed));
  for (const [slug, lesson] of lessons) {
    if (!claimed.has(slug)) {
      fail(
        `${locale}/lessons/${slug}.mdx`,
        "is not listed by any module — add it to a module manifest or delete it",
      );
    }
    if (lesson.primaryModule) {
      const owner = modules.get(lesson.primaryModule);
      if (!owner) {
        fail(`${locale}/lessons/${slug}.mdx`, `primaryModule "${lesson.primaryModule}" does not exist`);
      } else if (!owner.listed.includes(slug)) {
        fail(
          `${locale}/lessons/${slug}.mdx`,
          `primaryModule "${lesson.primaryModule}" does not list this lesson`,
        );
      }
    }
  }

  const orders = [...modules.values()].map((module) => module.order);
  if (new Set(orders).size !== orders.length) {
    warn(`${locale}/modules`, "two modules share the same order — display order will be arbitrary");
  }

  byLocale[locale] = { lessons, modules };
}

/* -- cross-locale parity -------------------------------------------------- */

const [base, ...others] = LOCALES;

for (const other of others) {
  const baseModules = new Set(byLocale[base].modules.keys());
  const otherModules = new Set(byLocale[other].modules.keys());

  for (const slug of baseModules) {
    if (!otherModules.has(slug)) fail(`${other}/modules`, `missing "${slug}.json" (exists in ${base})`);
  }
  for (const slug of otherModules) {
    if (!baseModules.has(slug)) fail(`${base}/modules`, `missing "${slug}.json" (exists in ${other})`);
  }

  for (const slug of baseModules) {
    if (!otherModules.has(slug)) continue;
    const a = byLocale[base].modules.get(slug);
    const b = byLocale[other].modules.get(slug);
    if (a.order !== b.order) warn(`modules/${slug}`, `order differs: ${base}=${a.order}, ${other}=${b.order}`);
    if (a.listed.join("|") !== b.listed.join("|")) {
      warn(`modules/${slug}`, `lesson order or membership differs between ${base} and ${other}`);
    }
  }

  for (const slug of byLocale[base].lessons.keys()) {
    if (!byLocale[other].lessons.has(slug)) {
      warn(`${other}/lessons`, `"${slug}.mdx" is not translated yet (exists in ${base})`);
      continue;
    }
    const a = byLocale[base].lessons.get(slug);
    const b = byLocale[other].lessons.get(slug);
    if (a.tags.join("|") !== b.tags.join("|")) {
      warn(`lessons/${slug}`, `tags differ between ${base} and ${other} — tags are language-neutral keys`);
    }
    if (a.level !== b.level) warn(`lessons/${slug}`, `level differs: ${base}=${a.level}, ${other}=${b.level}`);
  }

  for (const slug of byLocale[other].lessons.keys()) {
    if (!byLocale[base].lessons.has(slug)) {
      warn(`${base}/lessons`, `"${slug}.mdx" is not translated yet (exists in ${other})`);
    }
  }
}

/* -- unused tags ---------------------------------------------------------- */

const usedTags = new Set(
  LOCALES.flatMap((locale) => [...byLocale[locale].lessons.values()].flatMap((lesson) => lesson.tags)),
);
const unusedTags = [...tagKeys].filter((key) => !usedTags.has(key));
if (unusedTags.length > 0) {
  // Not a problem in itself — tags are registered ahead of the lessons that will
  // use them — but a typo shows up here as an unexpected name.
  warn("tags.json", `${unusedTags.length} tags defined but unused: ${unusedTags.join(", ")}`);
}

/* -- report --------------------------------------------------------------- */

const lessonCount = LOCALES.reduce((total, locale) => total + byLocale[locale].lessons.size, 0);
const moduleCount = byLocale[base].modules.size;

for (const message of warnings) console.warn(`  warn  ${message}`);
for (const message of errors) console.error(`  ERROR ${message}`);

console.log(
  `\n${moduleCount} modules · ${lessonCount} lessons across ${LOCALES.length} locales · ` +
    `${tagKeys.size} tags · ${errors.length} errors · ${warnings.length} warnings`,
);

process.exit(errors.length > 0 ? 1 : 0);
