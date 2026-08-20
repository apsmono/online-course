# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) as described in
`docs/VERSIONING.md`.

Every user-visible change gets an entry under `[Unreleased]` in the same commit
that makes it.

## [Unreleased]

Nothing yet.

## [0.2.0] — 2026-08-20

Stage: **alpha**

### Added

- Mathematics and Statistics modules in both locales, each with one written
  lesson and a ten- and nine-lesson roadmap respectively.
- Maths rendering with KaTeX at build time — `$inline$` and `$$display$$`.
- Canonical tag registry at `content/tags.json`: 30 language-neutral keys in four
  groups, with per-locale labels.
- Content validator at `npm run check:content`, plus `npm run check` which also
  runs lint and typecheck.
- Public roadmaps — `plannedLessons` in a module manifest renders as a greyed-out
  list under the module's real lessons.
- `plans/` docs for the accounts-and-database migration and the maths/statistics
  rollout.
- Version and release stage shown in the site footer.
- Project documentation: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT.md`,
  `docs/TAGS.md`, `docs/WORKFLOW.md`, `docs/VERSIONING.md`.
- Commit message template at `.gitmessage`.

### Changed

- **Content model is now many-to-many.** Lessons live flat in
  `content/<locale>/lessons/` and modules are manifests listing lesson slugs. A
  lesson may belong to any number of modules; sequence comes from its primary
  module.
- **Lesson URLs moved** from `/<locale>/learn/<track>/<lesson>` to
  `/<locale>/lessons/<slug>`. Safe to do without redirects because nothing was
  deployed. Not safe to repeat.
- Ordering comes from the module manifest rather than numeric filename prefixes.
- "Track" is now "module" throughout the UI and the code.
- Tags in frontmatter are keys rather than localised words, so a tag URL is the
  same in both languages.
- Topics page groups tags by registry group instead of listing them flat.
- Prose styles moved into `@layer components` so Tailwind utilities on MDX
  components take precedence.

### Fixed

- Callout bodies had no vertical rhythm between paragraphs.
- Lists inside `.not-prose` components rendered with stray bullet markers.
- Display maths now scrolls horizontally on narrow screens instead of overflowing.

## [0.1.0] — 2026-08-20

Stage: **scaffold**

### Added

- Bilingual (Bahasa Indonesia / English) statically prerendered Next.js site.
- MDX lessons on disk with frontmatter, folder-based tracks, and reading time.
- Client-side search over a statically generated per-locale index.
- `<Quiz>` and `<Callout>` MDX components; quizzes hold no state.
- Table of contents with scroll-spy, dual-theme code highlighting, sitemap,
  robots, and `hreflang` alternates.
- Two seed modules: Web Fundamentals and Learning How to Learn.
