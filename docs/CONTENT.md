# Writing content

## Files you will touch

```
content/tags.json                          the tag registry
content/<locale>/lessons/<slug>.mdx        the lesson
content/<locale>/modules/<module>.json     which module(s) list it
```

`<locale>` is `id` or `en`. **The filename is the URL slug** —
`describing-data.mdx` is served at `/id/lessons/describing-data`. Slugs are
lowercase kebab-case, in English, and identical across locales so the language
switcher lands on the translation.

## Adding a lesson

1. Create `content/id/lessons/<slug>.mdx` and `content/en/lessons/<slug>.mdx`.
2. Add the slug to at least one module manifest — in **both** locales, in the
   same position. A lesson listed by no module is an error, not a draft.
3. If it is listed by more than one module, set `primaryModule` in frontmatter.
4. `npm run check:content`.

### Frontmatter

```yaml
---
title: Describing data — centre and spread
summary: One sentence. Used as the meta description and in search results.
level: basic                 # basic | intermediate | advanced
tags: ["statistics", "descriptive-statistics", "data-literacy"]
primaryModule: statistics    # optional; required when >1 module lists it
updated: "2026-08-20"        # quoted, YYYY-MM-DD
draft: false                 # optional; true hides it from the whole site
---
```

All of `title`, `summary`, `level`, `tags`, and `updated` are required. `updated`
must be quoted — unquoted YAML dates parse as `Date` objects and the validator
will reject them.

## Modules

```json
{
  "title": "Statistics",
  "description": "Shown on the home page card and the module page.",
  "level": "intermediate",
  "order": 4,
  "lessons": ["describing-data", "percentages-and-proportions"],
  "plannedLessons": [
    { "slug": "probability-basics", "title": "Probability from first principles", "level": "intermediate" }
  ]
}
```

- `order` controls position on the home page and in the module list. Keep it
  unique and identical across locales.
- `lessons` is the teaching order. This array is the only thing that determines
  sequence — there are no numeric filename prefixes.
- `plannedLessons` is a public roadmap, rendered greyed-out under the real
  lessons. Moving a lesson from `plannedLessons` into `lessons` is what "shipping"
  it means; the validator fails if a slug appears in both.

## Can a lesson be in more than one module?

Yes — the model is many-to-many. But *should* it be? Use this test:

> Would a reader working through **either** module feel the lesson was missing if
> it were not there?

If both answers are yes, cross-list it. If only one is yes, it belongs to that
module and the other should get a link in its "where to go next" section instead.

**Cross-list.** `percentages-and-proportions` sits in Mathematics *and*
Statistics. You cannot do arithmetic without it, and you cannot read a statistic
without it. Removing it damages both sequences.

**Do not cross-list.** `how-the-web-works` is tempting to add to a future
"Digital Literacy" module. But a digital-literacy reader needs a paragraph and a
link, not a full lesson on TCP handshakes. Link it instead.

**Rule of thumb:** two modules is normal, three is a smell. A lesson wanted by
four modules is usually two lessons — a general one that gets cross-listed and a
specific one that does not. Cross-listing also has a cost: `previous`/`next`
follows the primary module only, so a reader in the secondary module gets pushed
sideways at the end of it. Accept that for genuinely shared foundations; avoid it
for convenience.

## Tags

Tags are **language-neutral keys** defined once in `content/tags.json`:

```json
"descriptive-statistics": {
  "group": "statistics",
  "id": "Statistika Deskriptif",
  "en": "Descriptive Statistics"
}
```

Frontmatter uses the key. The site shows the label for the current locale. The
key is also the URL at `/<locale>/topics/<key>`, so:

- Never rename a key that is live — add a redirect if you truly must.
- Never write a localised word in a `tags:` array.
- A lesson's tags must be identical in `id` and `en`. The validator warns
  otherwise.
- Add the tag to the registry **before** using it, or the build fails.

Aim for three to five tags per lesson: one broad (the field), one specific (the
sub-topic), and optionally one cross-cutting (`data-literacy`, `accessibility`).
See `docs/TAGS.md` for the full list.

## MDX components

### Callout

```mdx
<Callout type="warning" title="A common mistake">
Hiding a button with CSS does not stop anyone calling the endpoint behind it.
</Callout>
```

`type` is `note` (neutral), `tip` (do this), or `warning` (this bites people).

### Quiz

```mdx
<Quiz
  question="Which of these should be a button rather than a link?"
  choices={[
    { text: "'Add to cart', which updates the cart in place.", correct: true, explanation: "It acts on the current page." },
    { text: "'Read the full article'.", explanation: "This navigates, so it is a link." },
  ]}
/>
```

Mark several choices `correct` for a multi-answer question, or force it with
`multiple`. Write an `explanation` for **every** choice, including the wrong ones
— the explanation is where the teaching happens. Answers are checked in the
browser; nothing is stored, so a quiz must be self-contained.

Two quizzes per lesson is a good target: one mid-way, one at the end.

### Maths

Inline with single dollars, display with double:

```mdx
The mean is $\bar{x}$, defined as

$$
\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i
$$
```

KaTeX renders at build time, so there is no client-side cost and no flash of raw
LaTeX. KaTeX supports a subset of LaTeX — check
[the supported functions list](https://katex.org/docs/supported.html) before
reaching for an exotic macro. Inside a Markdown table cell, use `\dfrac` rather
than `\frac` so the fraction renders at display size.

### Code

Fenced blocks with a language tag get Shiki highlighting in both themes:

````mdx
```css
.page { display: grid; }
```
````

## House style

- **Second person, present tense.** "You send a request", not "the user sends".
- **Lead with the point.** The first paragraph should state what the lesson is
  for. No throat-clearing.
- **Concrete before abstract.** Show the salary list, then define the median.
- **Name the mistake.** Most lessons should say what people get wrong and why —
  that is usually the most valuable paragraph.
- **`##` and `###` only.** They form the table of contents. Never skip a level.
- **End with "Where to go next"** pointing at the next lesson or module.
- **Indonesian is not a translation of English.** Write it as Indonesian prose.
  Keep established English technical terms (`request`, `array`, `outlier`) where
  a forced translation would be less clear than the loanword.
- Target 800–1,500 words. Longer than that is usually two lessons.

## Before committing

```bash
npm run check          # lint + typecheck + content validator
npm run build          # catches MDX and KaTeX errors
```
