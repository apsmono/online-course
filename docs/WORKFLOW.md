# Commit, push, deploy

## Commit messages

Every commit uses this structure:

```
Short summary in the imperative, no trailing full stop

* one bullet per meaningful change
* another change, in the same voice
* a third

Co-Authored-By: Name <email>
```

Rules:

- **Summary line** — imperative mood ("Add", "Fix", "Move", not "Added" or
  "Adds"). Under 72 characters. No trailing period. No type prefix
  (`feat:`, `fix:`) — this project does not use Conventional Commits.
- **Blank line** after the summary. Always.
- **Bullets** — `*`, not `-`. One per change a reviewer would care about. Skip
  bullets entirely for a genuinely single-change commit; do not write one bullet
  that repeats the summary.
- **Blank line** before the trailer.
- **Trailer** — present only when an AI agent did the work. Omit the whole block
  for hand-written commits.

### Example

```
Add many-to-many modules and the Mathematics and Statistics tracks

* Flatten lessons to content/<locale>/lessons and add module manifests
* Move canonical lesson URLs to /<locale>/lessons/<slug>
* Render maths with KaTeX at build time
* Add a content validator behind npm run check:content

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Using the template

A template lives at `.gitmessage`. Wire it up once per clone:

```bash
git config commit.template .gitmessage
```

`git commit` (without `-m`) then opens the editor pre-filled with the structure.

## Before every commit

```bash
npm run check     # lint + typecheck + content validator
npm run build     # catches MDX, KaTeX, and prerender errors
```

Then update `CHANGELOG.md` under `## [Unreleased]` in the same commit.

## Branching

- `main` is always deployable. Vercel deploys it to production automatically.
- Work on a branch when the change spans more than one commit or you want a
  preview URL: `content/statistics-probability`, `feat/search-filters`,
  `fix/toc-scrollspy`.
- Single-commit content additions can go straight to `main`.

## First-time setup — putting this on GitHub

The repo has local commits but no remote yet.

```bash
cd ~/Developer/projects/course

# with the GitHub CLI
gh repo create apsmono/course --private --source=. --remote=origin --push

# or manually, after creating an empty repo in the GitHub UI
git remote add origin git@github.com:apsmono/course.git
git branch -M main
git push -u origin main
```

Push tags separately — `git push` does not carry them:

```bash
git push --follow-tags
```

## Deploying to Vercel

### One-time

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → pick the
   repo. The Next.js preset is detected; change no build settings.
2. **Settings → Environment Variables** → add
   `NEXT_PUBLIC_SITE_URL = https://course.apsmono.com` for Production. Without it
   the canonical URLs fall back to the value in `src/lib/site.ts`.
3. **Settings → Domains** → add `course.apsmono.com`.
4. At the DNS host for `apsmono.com`, add the record Vercel shows:

   ```
   CNAME   course   cname.vercel-dns.com.
   ```

   Behind Cloudflare, set it to **DNS only** (grey cloud) until the certificate
   is issued, then re-enable the proxy if you want it.
5. Wait for the certificate — usually a minute, occasionally an hour.

### Every deploy after that

```bash
git push
```

Vercel builds `main` and promotes it to production. Branches and pull requests
get their own preview URLs.

### After a production deploy

- Load `https://course.apsmono.com/` — it should redirect to `/id`.
- Check `/sitemap.xml` lists the new pages with the right origin.
- Spot-check one new lesson in both locales.
- On the first ever deploy, submit the sitemap in Google Search Console.

### Rolling back

Vercel → **Deployments** → pick the last good one → **Promote to Production**.
Instant, and no git history is rewritten. Fix forward afterwards.

## Releasing a version

See `docs/VERSIONING.md`. In short:

```bash
# bump "version" in package.json and STAGE in src/lib/version.ts
# move [Unreleased] entries into a new dated section in CHANGELOG.md
git commit -am "Release v0.3.0"
git tag -a v0.3.0 -m "v0.3.0"
git push --follow-tags
```
