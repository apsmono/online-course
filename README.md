# course.apsmono.com

A bilingual (Bahasa Indonesia / English) open-learning site. Lessons are MDX files
in this repo, rendered as a fully static Next.js site — no database, no accounts,
no request-time server.

**Stage:** `alpha` — see [`docs/VERSIONING.md`](docs/VERSIONING.md).

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /id
npm run check    # lint + typecheck + content validator
npm run build
```

## Documentation

| Read this | For |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Rules for anyone — human or AI — working in this repo. **Start here.** |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Directory map, content model, rendering pipeline |
| [`docs/CONTENT.md`](docs/CONTENT.md) | Writing lessons: frontmatter, components, house style |
| [`docs/TAGS.md`](docs/TAGS.md) | The tag registry and what each tag means |
| [`docs/WORKFLOW.md`](docs/WORKFLOW.md) | Commit format, branching, push, deploy |
| [`docs/VERSIONING.md`](docs/VERSIONING.md) | Version numbers, stages, git tags |
| [`docs/plans/`](docs/plans) | Approved-but-unbuilt work |
| [`CHANGELOG.md`](CHANGELOG.md) | What changed, when |

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, everything prerendered |
| Language | TypeScript |
| Styling | Tailwind v4 + hand-rolled `.prose` reading styles |
| Content | MDX on disk via `gray-matter` + `next-mdx-remote/rsc` |
| Maths | `remark-math` + `rehype-katex`, rendered at build time |
| Code | `rehype-pretty-code` / Shiki, dual light + dark theme |
| Search | `minisearch` in the browser over a static JSON index |
| i18n | Hand-rolled `/[locale]/` routing, no library |
| Hosting | Vercel |

## Content at a glance

```
content/
  tags.json                    canonical tag keys + per-locale labels
  <locale>/
    lessons/<slug>.mdx         one file per lesson; filename is the URL slug
    modules/<module>.json      ordered manifest listing lesson slugs
```

Lessons and modules are **many-to-many** — a lesson can appear in several modules
while keeping one canonical URL at `/<locale>/lessons/<slug>`. See
[`docs/CONTENT.md`](docs/CONTENT.md) for when that is the right call.

Four modules: Web Fundamentals, Learning How to Learn, Mathematics, Statistics.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build; prerenders every page |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run check:content` | Validate frontmatter, tags, manifests, locale parity |
| `npm run check` | lint + typecheck + `check:content` — run before committing |

## Deploying

Full instructions in [`docs/WORKFLOW.md`](docs/WORKFLOW.md). Short version: push
to GitHub, import to Vercel, add `course.apsmono.com` as a domain, and point a
`CNAME` at `cname.vercel-dns.com.`

## Out of scope for now

Accounts, progress tracking, quiz history, comments, and a CMS — see
[`docs/plans/accounts-and-database.md`](docs/plans/accounts-and-database.md) for
the plan and why it is deferred.
