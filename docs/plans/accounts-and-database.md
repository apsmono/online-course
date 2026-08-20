# Plan — accounts, progress tracking, and a database

**Status:** not started. Deferred out of v1.0 deliberately.
**Blocked on:** enough content that progress tracking is worth having. Roughly 30
published lessons, or the first user who asks for it.

## Why this is not built yet

The site is fully static: no server, no database, no session. That buys free
hosting, effectively infinite scale, and a codebase where nothing can be
half-broken at request time. Every one of those properties is spent the moment
accounts arrive. Do not spend them for a feature nobody has asked for on a site
with five lessons.

## The principle that keeps this cheap

**Content stays in git. Only user data goes in a database.**

Lessons, modules, and tags remain MDX and JSON in this repo, prerendered at build
time. The database holds only what is specific to a person: which lessons they
finished, what they answered, what they saved. Pages stay static; user state
arrives client-side after hydration.

This is the difference between "add a feature" and "rewrite the site". Any
proposal that moves lesson content into the database should be rejected — it
would make the site slower, harder to edit, and impossible to review in a pull
request.

## Architecture after the change

```
  content/*.mdx ──▶ build ──▶ static HTML (unchanged, cached at the edge)
                                   │
                                   ▼
                          client-side island
                                   │  fetch
                                   ▼
                    /api/progress  (Vercel function)
                                   │
                                   ▼
                          Postgres + auth provider
```

Lesson pages keep their current cache headers. A small client component asks the
API for this reader's state and paints a checkmark. A logged-out reader sees
exactly what they see today.

## Provider decision — to be made before phase 1

| Option | Good | Bad |
| --- | --- | --- |
| **Supabase** | Postgres + auth + row-level security in one product; generous free tier; SQL you can leave with | Another dashboard; RLS has a learning curve |
| **Auth.js + Neon** | Maximum control; Auth.js is the Next.js default; Neon scales to zero | Two services; you own more of the auth surface |
| **Clerk + any Postgres** | Best-in-class auth UX out of the box | Priced per user; auth data lives outside your database |

**Leaning Supabase** — one service, and row-level security means a bug in an API
route cannot leak another reader's rows. Revisit if the cost of a second
dashboard turns out to matter more than that.

Sign-in method: **email magic link + Google**, no passwords. Passwords mean reset
flows, breach exposure, and a support burden that a free learning site should not
carry.

## Schema sketch

Content is referenced by its slug — never by a foreign key into a content table,
because there is no content table.

```sql
-- Managed by the auth provider; shown for context.
-- users(id uuid pk, email text unique, created_at timestamptz)

create table lesson_progress (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  lesson_slug  text        not null,
  locale       text        not null check (locale in ('id','en')),
  status       text        not null check (status in ('started','completed')),
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, lesson_slug, locale)
);

create table quiz_attempts (
  id           bigserial   primary key,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  lesson_slug  text        not null,
  locale       text        not null,
  quiz_index   int         not null,   -- position of the quiz within the lesson
  correct      boolean     not null,
  answered_at  timestamptz not null default now()
);

create table bookmarks (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  lesson_slug text        not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

create index on lesson_progress (user_id, completed_at desc);
create index on quiz_attempts   (user_id, lesson_slug);
```

Notes:

- `lesson_slug` is deliberately a plain text column with no constraint. A slug
  that disappears from the repo leaves an orphan row, which is harmless — far
  better than a foreign key that makes deleting a lesson a migration.
- `locale` is stored because finishing a lesson in Indonesian does not mean you
  read the English one. Whether that should count as the same lesson is a product
  question — decide it before writing the dashboard.
- `quiz_index` is positional, so reordering quizzes inside a lesson invalidates
  history. Acceptable; if it stops being acceptable, add a stable `id` to the
  `<Quiz>` component and store that instead.

## Phases

### Phase 0 — decide (half a day)

- [ ] Pick the provider and sign-in methods
- [ ] Decide whether progress is per-locale or shared across locales
- [ ] Decide what a logged-out reader keeps (nothing / localStorage that merges on
      sign-in)
- [ ] Write the privacy policy — under Indonesia's PDP Law (UU 27/2022) you need
      a lawful basis and a stated retention period before collecting anything.
      Get this checked by someone qualified; this document is not legal advice.

### Phase 1 — auth only, no features (1–2 days)

- [ ] Add the provider SDK and environment variables
- [ ] `/[locale]/sign-in` and `/[locale]/account`, both statically shell-rendered
- [ ] Session-aware header: sign in / avatar
- [ ] Account deletion that actually deletes rows — build it now, not later
- [ ] Confirm every existing page still prerenders and is still cached

Ship this and leave it. If sign-in is broken, find out before it guards anything.

### Phase 2 — progress (2–3 days)

- [ ] `POST /api/progress` — mark started/completed, idempotent
- [ ] `GET /api/progress` — this reader's rows, one request per page load
- [ ] "Mark complete" on the lesson page; checkmarks on module pages
- [ ] "Continue where you left off" on the home page for signed-in readers
- [ ] Row-level security policies, with a test proving reader A cannot read B

### Phase 3 — quiz history (1–2 days)

- [ ] Add a stable `id` prop to `<Quiz>` and backfill it across all lessons
- [ ] Record attempts; show past results when revisiting a lesson
- [ ] Aggregate view: which topics this reader gets wrong most

### Phase 4 — the things that will get requested (unscoped)

- Bookmarks and a reading list
- Notes on a lesson
- Streaks — tempting, and worth resisting unless the goal is genuinely retention
- Spaced-repetition scheduling built from `quiz_attempts`, which is the honest
  version of what the Learning How to Learn module teaches

## What will break, and the mitigations

| Risk | Mitigation |
| --- | --- |
| Static pages quietly become dynamic because a layout reads the session | Never read the session in a layout or page — only in client components. Add a build assertion that page count stays static. |
| A slug rename orphans progress rows | Slugs are already immutable by rule (`AGENTS.md`). If one must change, write a migration in the same commit. |
| Auth outage takes down reading | Content pages must never await the session. A failed session fetch renders the logged-out view. |
| Privacy obligations arrive with the first row | Phase 0 writes the policy before phase 1 collects anything. |
| Free tiers change | Everything here is portable Postgres. Keep migrations in the repo, not in a dashboard. |

## Explicitly out of scope

Payments, certificates, instructor accounts, comments, and user-submitted
content. Each turns this from a reading site into a platform, with moderation and
support obligations to match. Decide separately, not as a side effect of adding
sign-in.

## Related

- Search will need revisiting around the same scale — see the search section in
  `docs/ARCHITECTURE.md`. Past roughly a thousand lessons the client-side index
  gets too heavy to ship, and that is a separate decision from this one.
