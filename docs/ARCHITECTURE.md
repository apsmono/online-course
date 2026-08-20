# Architecture

## Shape of the thing

A static site. `next build` reads `content/`, prerenders every page, and emits
HTML. Nothing runs on a server at request time — no database, no session, no API
calls. That constraint is deliberate: it makes the site free to host, impossible
to take down with traffic, and trivial to reason about.

```
                    build time                         request time
  content/*.mdx ──▶ src/lib/content.ts ──▶ pages ──▶  static HTML ──▶ browser
  content/*.json                        ──▶ sitemap
                                        ──▶ /search-index/<locale> (JSON)
                                                                     │
                                                     minisearch ◀────┘ (client)
```

## Directory map

```
content/
  tags.json                    Canonical tag registry — keys, groups, per-locale labels
  <locale>/
    lessons/<slug>.mdx         One file per lesson. Filename IS the URL slug.
    modules/<module>.json      Ordered manifest referencing lesson slugs

docs/
  ARCHITECTURE.md              This file
  CONTENT.md                   How to author lessons and modules
  TAGS.md                      The tag list and what each one means
  WORKFLOW.md                  Commit, push, deploy
  VERSIONING.md                Version numbers, stages, git tags
  plans/                       Approved-but-unbuilt work

scripts/
  check-content.mjs            Content validator (npm run check:content)

src/
  app/
    layout.tsx                 Pass-through. Does NOT render <html>.
    page.tsx                   / → redirect to the default locale
    not-found.tsx              Global 404 (renders its own document)
    sitemap.ts  robots.ts      Generated from the content layer
    search-index/[locale]/     Static JSON search index, one per locale
    [locale]/
      layout.tsx               Renders <html lang>, header, footer, metadata
      page.tsx                 Home — module cards
      learn/page.tsx           All modules
      learn/[module]/page.tsx  One module: its lessons, then its roadmap
      lessons/[lesson]/page.tsx  A lesson — canonical URL for content
      topics/page.tsx          Tags grouped by registry group
      topics/[tag]/page.tsx    Lessons carrying one tag
      search/page.tsx          Client-side search
      not-found.tsx            404 inside a locale
  components/                  UI + MDX components
  lib/
    content.ts                 THE content layer. Only module that touches disk.
    i18n.ts                    Locales, levels, every UI string
    site.ts                    Canonical origin
    version.ts                 Version + release stage
```

## The content model

Lessons and modules are **many-to-many**.

- A lesson is a standalone file with a slug unique within its locale. Its
  canonical URL is `/<locale>/lessons/<slug>` and does not mention any module.
- A module is a manifest that lists lesson slugs in teaching order. Any number of
  modules may list the same lesson.
- Because the URL is module-independent, cross-listing a lesson creates no
  duplicate content and no ambiguity about which URL is canonical.

### Primary module

Sequential navigation (previous/next, and the back-link at the top of a lesson)
needs one ordering, so each lesson resolves to exactly one **primary module**:

1. the module named in the lesson's `primaryModule` frontmatter, if it lists the
   lesson; otherwise
2. the lowest-`order` module that lists the lesson.

Other modules containing the lesson are shown as "Also in" links. This is
resolved at build time, so it stays fully static — there is no `?from=` query
parameter and no dynamic rendering.

### Trade-off being accepted

A reader following the Statistics module through a cross-listed lesson will find
that "next" points into Mathematics, because Mathematics is that lesson's primary
module. The alternative — module-scoped URLs — costs duplicate content and a
canonical-URL problem, which is worse. Cross-list sparingly: only when the lesson
is genuinely core to both modules.

## Rendering pipeline

`src/components/mdx.tsx` compiles MDX per lesson at build time:

| Stage | Plugin | Why |
| --- | --- | --- |
| remark | `remark-gfm` | Tables, strikethrough, task lists |
| remark | `remark-math` | Recognise `$…$` and `$$…$$` |
| rehype | `rehype-slug` | Stable heading ids, matched by the TOC |
| rehype | `rehype-katex` | Render maths to HTML at build time |
| rehype | `rehype-pretty-code` | Shiki highlighting, light + dark themes |
| rehype | `rehype-autolink-headings` | Anchor link on hover |

`next-mdx-remote` v6 strips JSX expression props by default. The options set
`blockJS: false` so `<Quiz choices={[…]}>` survives. Safe here because content is
authored in-repo; **not** safe for user-submitted MDX.

## Styling

Tailwind v4, plus a hand-rolled `.prose` in `src/app/globals.css` rather than the
typography plugin — it gives exact control over the reading column, which is the
product.

Prose rules live inside `@layer components` so Tailwind utilities applied to MDX
components still win. Colours are CSS variables switched by
`prefers-color-scheme`; there is no theme toggle and no client-side theme state.

## Search

`getSearchIndex()` produces a plain-text document per lesson. The route handler
`/search-index/<locale>` is `force-static`, so it is a JSON file on the CDN. The
search page fetches it once and builds a MiniSearch index in the browser.

At a few hundred lessons this is still comfortably small. Past roughly a thousand,
move to a prebuilt serialised index or a hosted search service — see
`docs/plans/accounts-and-database.md` for where that decision belongs.

## Internationalisation

Hand-rolled, no library:

- `locales = ["id", "en"]`, `defaultLocale = "id"`.
- Every route is under `/[locale]/`. `/` redirects to `/id`.
- `src/app/layout.tsx` is a pass-through so `[locale]/layout.tsx` can set
  `<html lang>` from the route.
- UI strings live in one typed dictionary in `src/lib/i18n.ts`. Adding a key
  fails the typecheck until both locales define it — which is the point.
- `hreflang` alternates are emitted per page from `generateMetadata`.

## Adding a locale

1. Add the code to `locales` in `src/lib/i18n.ts` and add its dictionary entry.
2. Add a label for the new locale to every tag in `content/tags.json`.
3. Create `content/<locale>/lessons/` and `content/<locale>/modules/`, mirroring
   the module manifests.
4. Run `npm run check:content`.

Routing, sitemap, alternates, and the language switcher pick it up automatically.
