<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# course.apsmono.com — agent rules

Read this file first. Then read `docs/ARCHITECTURE.md` for the code map and
`docs/CONTENT.md` before touching anything under `content/`.

## What this project is

A bilingual (Bahasa Indonesia / English) open-learning site. Every page is
prerendered at build time. There is no database, no authentication, and no
request-time server logic. Keep it that way unless a plan in `docs/plans/`
says otherwise and the user has approved it.

## Non-negotiable rules

1. **Never change a published slug.** Lesson slugs, module slugs, and tag keys
   are URLs. Renaming one breaks inbound links and search rankings. If a rename
   is genuinely required, add a redirect in `next.config.ts` in the same commit.
2. **Tags are keys, not words.** Frontmatter carries the key (`accessibility`);
   the visible label comes from `content/tags.json` per locale. Never put a
   Bahasa Indonesia word in a `tags:` array. Add new tags to the registry first.
3. **Keep locales in structural parity.** Both `id/` and `en/` must have the same
   set of module manifests. Lesson translations may lag — the validator warns
   rather than fails — but a lesson's `tags` and `level` must match across
   locales.
4. **Run `npm run check` before you commit.** It runs lint, typecheck, and the
   content validator. A red validator means a broken page or dead link.
5. **Do not add a runtime dependency to render content.** The content layer reads
   the filesystem at build time only. `src/lib/content.ts` is the single module
   that touches disk; everything else goes through it.
6. **Do not render untrusted MDX.** `src/components/mdx.tsx` sets
   `blockJS: false` so `<Quiz choices={[...]}>` works. That is only safe because
   every lesson is authored in this repo.
7. **Update `CHANGELOG.md`** in the same commit as any user-visible change.
8. **Write prose, not filler.** Lessons are the product. A lesson that restates
   its own headings is worse than no lesson.

## Where things live

| I want to… | Go to |
| --- | --- |
| Add or edit a lesson | `content/<locale>/lessons/<slug>.mdx` |
| Change what a module contains or its order | `content/<locale>/modules/<module>.json` |
| Add a tag | `content/tags.json`, then `docs/TAGS.md` |
| Change UI wording | `src/lib/i18n.ts` — both locales, always |
| Change how content is read | `src/lib/content.ts` |
| Change MDX rendering or plugins | `src/components/mdx.tsx` |
| Add a page | `src/app/[locale]/…` |
| Understand the layout | `docs/ARCHITECTURE.md` |
| Commit, push, or deploy | `docs/WORKFLOW.md` |
| Bump the version | `docs/VERSIONING.md` |

## Commit messages

Every commit follows the structure in `docs/WORKFLOW.md`:

```
Short summary in the imperative

* what changed, one bullet per meaningful change
* another change

Co-Authored-By: <agent> <email>
```

The trailer block is only present when an AI agent did the work.

## Before you say you are done

- [ ] `npm run check` passes
- [ ] `npm run build` completes
- [ ] `CHANGELOG.md` has an entry under `[Unreleased]`
- [ ] Both locales updated, or the gap is deliberate and noted
- [ ] No slug was renamed without a redirect
