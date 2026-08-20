# Versioning and stages

Two independent signals:

- **Version** — `version` in `package.json`, tagged in git. Semantic versioning.
- **Stage** — `STAGE` in `src/lib/version.ts`. Answers "how finished is this?"

Both are shown in the site footer as `v0.2.0 · alpha`.

## Stages

| Stage | Means | Deployed? |
| --- | --- | --- |
| `scaffold` | Structure exists, content is placeholder | No |
| `alpha` | Content is being written | No |
| `beta` | Live and reachable, content still thin | Yes, unannounced |
| `stable` | Launched and maintained | Yes |

**Current: `alpha`.** The site is complete and builds; two modules have real
content and two are outlines. It moves to `beta` on the first production deploy
to `course.apsmono.com`, and to `stable` when both flagship modules are finished.

## Version numbers

`MAJOR.MINOR.PATCH`, where the "public API" is the set of live URLs and the
content model.

| Bump | When |
| --- | --- |
| **MAJOR** | A URL shape changes, or the content model changes such that existing lessons need rewriting. Reserved for after 1.0. |
| **MINOR** | New module, new feature, new page, new MDX component, or a batch of new lessons. |
| **PATCH** | Fixes, typos, styling, one or two lessons added to an existing module. |

`1.0.0` is the first production deploy with enough content to be useful — the
milestone from the original brief: basic through advanced material someone might
actually come looking for. Before that, `0.x` versions may break URLs if the
change is clearly worth it, and the CHANGELOG says so.

## History so far

| Version | Stage | What |
| --- | --- | --- |
| 0.1.0 | scaffold | Bilingual MDX site, folder-based tracks, search, quizzes |
| 0.2.0 | alpha | Many-to-many modules, KaTeX, Maths + Statistics, docs and tooling |

## Releasing

1. Decide the bump from the table above.
2. Update `version` in `package.json`.
3. Update `STAGE` in `src/lib/version.ts` if the stage changed.
4. In `CHANGELOG.md`, rename `## [Unreleased]` to `## [0.3.0] — 2026-09-01` and
   open a fresh empty `[Unreleased]` above it.
5. Add a row to the history table above.
6. Commit and tag:

   ```bash
   git commit -am "Release v0.3.0"
   git tag -a v0.3.0 -m "v0.3.0"
   git push --follow-tags
   ```

Tags are annotated (`-a`), never lightweight — annotated tags carry a date and
author, which is the point of tagging.

## Reading where you are

```bash
git describe --tags          # e.g. v0.2.0-4-gab12cd3 → 4 commits past v0.2.0
git tag -l -n9               # every release with its message
```

The footer shows the same thing to anyone looking at the deployed site.
