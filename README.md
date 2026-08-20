# course.apsmono.com

A bilingual (Bahasa Indonesia / English) open-learning site. Lessons are MDX files in this repo,
rendered as a fully static Next.js site.

**v1.0 scope:** read, browse, search, and self-test. No accounts, no database, no tracking.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, static export via `generateStaticParams`) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + hand-rolled `.prose` reading styles |
| Content | MDX files on disk, read with `gray-matter` + `next-mdx-remote/rsc` |
| Code highlighting | `rehype-pretty-code` / Shiki, dual light+dark theme |
| Search | `minisearch`, client-side, over a statically generated JSON index |
| i18n | Hand-rolled `/[locale]/` routing — no i18n library |
| Hosting | Vercel |

Every page is prerendered at build time. There is no server-side rendering at request time and no
runtime database.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /id
npm run build    # production build, prerenders every lesson
npm run start    # serve the production build
npm run lint
```

## Writing a lesson

Content lives in `content/<locale>/<track>/`. Locales are `id` and `en`.

```
content/
  id/
    web-fundamentals/
      _track.json
      01-how-the-web-works.mdx
  en/
    web-fundamentals/
      _track.json
      01-how-the-web-works.mdx
```

**The filename sets the order and the URL.** `03-css-layout.mdx` becomes lesson #3 at
`/id/learn/web-fundamentals/css-layout`. Keep the slug identical across locales so the language
switcher lands on the translated page.

### Track metadata — `_track.json`

```json
{
  "title": "Web Fundamentals",
  "description": "One or two sentences shown on the home page card.",
  "level": "basic",
  "order": 1
}
```

### Lesson frontmatter

```yaml
---
title: Layout with Flexbox and Grid
summary: One sentence used as the page description and in search results.
level: intermediate        # basic | intermediate | advanced
tags: ["web", "css", "layout"]
updated: "2026-08-20"
draft: false               # true hides the lesson everywhere
---
```

Optional overrides: `slug` (override the filename-derived slug) and `order` (override the numeric
prefix).

### Components available inside MDX

**`<Callout>`** — an aside, `type` is `note`, `tip`, or `warning`.

```mdx
<Callout type="warning" title="Watch out">
Hiding a button with CSS does not stop anyone calling the endpoint behind it.
</Callout>
```

**`<Quiz>`** — a comprehension check. Mark one choice `correct` for single-answer, several for
multi-answer (or force it with `multiple`). Answers are checked in the browser and nothing is
stored.

```mdx
<Quiz
  question="Which of these should be a button rather than a link?"
  choices={[
    { text: "'Add to cart', which updates the cart in place.", correct: true, explanation: "It acts on the current page." },
    { text: "'Read the full article'.", explanation: "This navigates, so it is a link." },
  ]}
/>
```

Standard Markdown, GFM tables, and fenced code blocks all work. Headings `##` and `###` are picked
up automatically for the table of contents.

<!-- prettier-ignore -->
> **Note on MDX and JavaScript**
> `next-mdx-remote` strips JSX expression props by default. This project sets `blockJS: false` in
> `src/components/mdx.tsx` so `<Quiz choices={[...]}>` works. That is safe because all content is
> authored in this repo — **do not** render MDX from untrusted sources without re-enabling it.

## Adding a language

1. Add the code to `locales` in `src/lib/i18n.ts` and fill in a matching `dictionaries` entry.
2. Create `content/<new-locale>/` and mirror the track folders.

Routing, sitemap, `hreflang` alternates, and the language switcher pick it up automatically.

## Project layout

```
content/                     MDX lessons, one folder per locale
src/app/[locale]/            All routed pages (home, learn, topics, search)
src/app/search-index/        Static JSON search index, one per locale
src/app/sitemap.ts           Sitemap covering every locale, track, lesson and tag
src/components/              UI + MDX components (Quiz, Callout, Toc, Search)
src/lib/content.ts           Filesystem content layer — the only place that touches disk
src/lib/i18n.ts              Locales, levels, and all UI strings
src/lib/site.ts              Canonical site URL
```

`src/app/layout.tsx` is deliberately a pass-through: `src/app/[locale]/layout.tsx` renders
`<html lang>` so the language attribute follows the route.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import it. The framework preset is detected automatically —
   no build settings to change.
3. Under **Settings → Domains**, add `course.apsmono.com`.
4. At the DNS host for `apsmono.com`, add the record Vercel shows you:

   ```
   CNAME   course   cname.vercel-dns.com.
   ```

   If `apsmono.com` sits behind Cloudflare, set that record to **DNS only** (grey cloud) until the
   certificate is issued.
5. Optionally set `NEXT_PUBLIC_SITE_URL=https://course.apsmono.com` in the project's environment
   variables. Without it the canonical URL falls back to the value in `src/lib/site.ts`.

Preview deployments are created for every branch and pull request.

## Deliberately out of scope for v1.0

Accounts, progress tracking, quiz history, comments, and a CMS. The content layer is a single module
(`src/lib/content.ts`), so swapping the filesystem for a database later touches one file rather than
every page.
