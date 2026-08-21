# Plan — Probability of prioritized options in polling

**Status:** specified, unbuilt. This document is the complete brief for the
implementing agent. Read `AGENTS.md` and `docs/CONTENT.md` first; everything
here assumes those rules and never overrides them.

**Owner:** Amalia · **Target module:** Mathematics (`order: 3`)
**Shape:** 1 lesson × 2 locales, 1 self-verifying practice bank of 100 items ×
2 locales, 1 new route, ~22 new i18n keys, 1 validator extension, 4 commits.

---

## 0. Source material

This lesson comes from a conversation titled *"Probability of prioritized
options in polling"*. Its worked example is the spine of the lesson and must
survive into the published text — the reader was promised these numbers.

**The scenario.** A poll draws **4 options from a pool of 35**. Of those 35,
**10 sit on a priority list**. The respondent picks 1 of the 4 shown. Question:
how often does the priority list actually appear among the 4?

That is a **hypergeometric** draw — 4 items without replacement from 35, of
which 10 are "successes". Not binomial: the draws inside one poll are dependent,
because an option already shown cannot be shown again.

### 0.1 Arithmetic audit of the source

Every figure in the conversation was recomputed with exact rational arithmetic.
**The main distribution table is correct and can be published as-is.** Three
figures in the closing paragraph are wrong and must not be copied.

Correct, verified:

| Quantity | Source | Verified |
| --- | --- | --- |
| $\binom{35}{4}$ | 52,360 | ✅ |
| $P(X=0)$ | $115/476 \approx 24.160\%$ | ✅ |
| $P(X=1)$ | $575/1{,}309 \approx 43.926\%$ | ✅ (43.927%) |
| $P(X=2)$ | $675/2{,}618 \approx 25.783\%$ | ✅ |
| $P(X=3)$ | $75/1{,}309 \approx 5.730\%$ | ✅ |
| $P(X=4)$ | $21/5{,}236 \approx 0.401\%$ | ✅ value correct; **reduce to $3/748$** |
| $P(X \ge 1)$ | $361/476 \approx 75.84\%$ | ✅ |
| $E[X]$ | $8/7 \approx 1.143$ | ✅ |
| Sequential check | 0.2416 | ✅ |
| Shut out over 2 / 3 / 5 polls | 5.84% / 1.41% / 0.082% | ✅ |

**Wrong — fix before publishing:**

| Priority list size | Source says $P(X\ge1)$ | Correct |
| --- | --- | --- |
| 8 | 68.6% | **66.482%** |
| 6 | 59.6% | **54.639%** |
| 5 | 53.9% | **47.660%** |

The full corrected sensitivity table, which the lesson should carry instead:

| Priority list size $K$ | $P(X=0)$ | $P(X \ge 1)$ |
| --- | --- | --- |
| 10 | 24.160% | **75.840%** |
| 9 | 28.552% | 71.448% |
| 8 | 33.518% | 66.482% |
| 7 | 39.104% | 60.896% |
| 6 | 45.361% | 54.639% |
| 5 | 52.340% | 47.660% |

The qualitative claim built on those numbers — *shrinking the priority list
costs hit rate, so there is a real trade-off between list purity and pick
quality* — survives intact, and gets **stronger**: the true decline is steeper
than the source suggested. Halving the list from 10 to 5 cuts the hit rate from
75.8% to 47.7%, not to 53.9%.

> **Rule for the implementing agent:** every numeric claim in the lesson and in
> all 100 practice items is machine-verified before commit (§9.2). The source
> conversation is proof that hand-checked probability arithmetic drifts.

---

## 1. What ships

| # | Deliverable | Where |
| --- | --- | --- |
| 1 | Lesson: probability calculation, background, basics — built on the 35/10/4 poll | `content/<locale>/lessons/probability-in-polling.mdx` |
| 2 | 100 study cases as test material | `content/<locale>/practice/probability-in-polling.json` |
| 3 | A worked explanation on every study case | same file — `solution` + per-choice `explanation` |
| 4 | Test page that picks a random *n* from the bank | `/<locale>/practice/probability-in-polling` |

Non-goals: accounts, saved scores, progress tracking, a CMS. Those stay in
`docs/plans/accounts-and-database.md`. Nothing added here may introduce
request-time server logic or a runtime dependency for rendering content
(`AGENTS.md` rules 1 and 5).

---

## 2. Decisions already made

Taken against the repo's own rules. Do not relitigate.

| Decision | Choice | Why |
| --- | --- | --- |
| Slug | `probability-in-polling` | English kebab-case, identical in both locales, never renamed (`AGENTS.md` rule 1). |
| Module membership | Mathematics **only** | Amalia asked for Mathematics. Statistics already has `probability-basics` on its roadmap and that is the lesson which cross-lists (`docs/plans/archive/mathematics-and-statistics.md`). Two probability lessons in one module is a smell. Link, don't cross-list. |
| Position in the manifest | second, after `percentages-and-proportions` | The only other written lesson, and this one leans on it. Manifest order is the only thing that decides sequence. |
| `level` | `intermediate` | Combinatorics plus a named distribution. Must match across locales or the validator warns. |
| `primaryModule` | omit | Only one module lists it. Adding the key is noise. |
| Study-case storage | JSON under `content/<locale>/practice/`, **not** MDX | 100 items must be shuffled and sampled at runtime; MDX compiles to a fixed tree at build time. This also settles the open question in `docs/plans/archive/mathematics-and-statistics.md` — `<Quiz>` stays for in-lesson checks, the bank is a separate thing. |
| Maths in study cases | pre-rendered to HTML at **build** time with `katex.renderToString` | `katex` is already a dependency. Shipping KaTeX to the browser adds a client cost the architecture avoids; plain-text-only items would cripple the notation. |
| Answer correctness | **machine-verified in the validator**, not trusted | §9.2. Given §0.1, this is the single most important decision in this plan. |
| Item delivery to the client | React props from the static page | ~100 items ≈ 60–80 KB of flight payload per locale, embedded in already-static HTML. If a bank ever exceeds ~250 items, move to a `force-static` JSON route mirroring `src/app/search-index/[locale]/route.ts`. |
| Persistence of results | none | `src/components/quiz.tsx` sets the precedent: "nothing is persisted, which matches the no-accounts scope of v1". No `localStorage`. |
| Randomness | seeded, generated on user action, never during render | §7.4 — the one thing that produces a hydration bug if done casually. |

---

## 3. The lesson

### 3.1 Frontmatter

```yaml
---
title: Probability of prioritized options in polling
summary: A poll shows you 4 options out of 35, and 10 of them are on your priority list. Here is how to compute the chance your list appears at all — and what that says about how long the list should be.
level: intermediate
tags: ["mathematics", "combinatorics", "probability", "polling"]
updated: "2026-08-21"
practiceSet: probability-in-polling
---
```

Indonesian: `title: Peluang opsi prioritas dalam polling`. Write the `summary`
as Indonesian prose, not a translation (`docs/CONTENT.md`, house style).
`tags`, `level`, and `practiceSet` are **identical** across locales — tags are
language-neutral keys and the validator warns when they diverge.

`practiceSet` is a new frontmatter key introduced by this plan. It links the
lesson to its bank so the lesson page can render a "take the test" call to
action, and so the validator can check the link resolves both ways (§9.1).

### 3.2 The model

$N = 35$ options in the pool, $K = 10$ of them on the priority list,
$n = 4$ drawn and shown per poll, and $X$ = how many of the 4 shown are on the
list. Then

$$
P(X = k) = \frac{\dbinom{K}{k}\dbinom{N-K}{\,n-k\,}}{\dbinom{N}{n}}
= \frac{\dbinom{10}{k}\dbinom{25}{4-k}}{\dbinom{35}{4}},
\qquad \binom{35}{4} = 52{,}360
$$

**State the assumptions out loud, early.** All 35 options equally likely, the 4
shown always distinct, no weighting, and polls independent of one another. If
the real system weights options or avoids repeats across consecutive polls,
every number below shifts. Naming the model's assumptions *is* the lesson's
intellectual honesty, and it matches the house rule about naming what goes
wrong.

### 3.3 The three cases the reader asked for

Teach them in the order **none → exactly one → at least one**, because the third
is free once the first is done. That ordering is itself a lesson in
strategy: compute the easy tail, then subtract.

**Case 3 — none of the priority list appears** ($k=0$)

$$
P(X=0) = \frac{\binom{25}{4}}{\binom{35}{4}} = \frac{12{,}650}{52{,}360}
= \frac{115}{476} \approx 24.160\%
$$

Verify it a second way, by sequential draw — this is the paragraph that makes
"without replacement" concrete:

$$
\frac{25}{35}\cdot\frac{24}{34}\cdot\frac{23}{33}\cdot\frac{22}{32} = 0.2416
$$

Each denominator shrinks because the option already drawn is gone. That
shrinking denominator is exactly the difference between hypergeometric and
binomial, and it is worth a `<Callout type="note">`.

**Case 2 — exactly one** ($k=1$)

$$
P(X=1) = \frac{\binom{10}{1}\binom{25}{3}}{\binom{35}{4}}
= \frac{10 \times 2{,}300}{52{,}360} = \frac{575}{1{,}309} \approx 43.926\%
$$

The two binomial coefficients answer two separate questions — *which* priority
option, and *which three* non-priority ones — and multiply because every pairing
is a distinct outcome. Say that; it is the step readers skip.

**Case 1 — at least one** ($k \ge 1$)

$$
P(X \ge 1) = 1 - P(X=0) = \frac{361}{476} \approx 75.840\%
$$

Name the complement rule here, and note that the alternative — summing
$k=1,2,3,4$ — gives the same answer for four times the work.

### 3.4 The full distribution

| $k$ | Favourable draws | Probability | % |
| --- | --- | --- | --- |
| 0 | 12,650 | $\dfrac{115}{476}$ | 24.160 |
| 1 | 23,000 | $\dfrac{575}{1{,}309}$ | 43.927 |
| 2 | 13,500 | $\dfrac{675}{2{,}618}$ | 25.783 |
| 3 | 3,000 | $\dfrac{75}{1{,}309}$ | 5.730 |
| 4 | 210 | $\dfrac{3}{748}$ | 0.401 |
| **Total** | **52,360** | **1** | **100** |

Use `\dfrac` inside table cells, never `\frac`. Note $3/748$, the reduced form —
the source's $21/5{,}236$ is the same number unreduced.

The counts summing to exactly 52,360 is worth pointing out: it is a proof the
five cases are exhaustive and mutually exclusive, not a coincidence.

$$
E[X] = n \cdot \frac{K}{N} = 4 \times \frac{10}{35} = \frac{8}{7} \approx 1.143
$$

Optional, for the advanced-curious — the finite-population correction is the
whole story of "without replacement":

$$
\operatorname{Var}(X) = n\frac{K}{N}\left(1-\frac{K}{N}\right)\frac{N-n}{N-1}
= \frac{620}{833} \approx 0.744, \qquad \operatorname{sd}(X) \approx 0.863
$$

The factor $\frac{N-n}{N-1} = \frac{31}{34}$ is *below 1* — drawing without
replacement makes the count less variable than a binomial with the same mean.

### 3.5 The practical read

The reader picks 1 of the 4 shown, so **"at least one" is the number that
matters**: a priority option is available **75.8% of the time**, and roughly
**1 poll in 4 forces an off-list pick**.

Across $m$ independent polls, being shut out every time is $0.2416^{m}$:

| Polls | Chance of zero priority hits |
| --- | --- |
| 2 | 5.84% |
| 3 | 1.41% |
| 5 | 0.082% |

This is the second distribution in the lesson and the contrast is the point:
**within one poll the draws are dependent (hypergeometric); across polls they
are independent (a plain power, and binomial if you count hits).** Same
scenario, two different models, chosen by what the question is about. Make that
explicit — it is the most transferable idea in the lesson.

Then the trade-off, using the corrected table from §0.1:

| Priority list size $K$ | $P(X \ge 1)$ |
| --- | --- |
| 10 | 75.840% |
| 9 | 71.448% |
| 8 | 66.482% |
| 7 | 60.896% |
| 6 | 54.639% |
| 5 | 47.660% |

Tightening the list to only what you truly want costs you hit rate. Halving it
from 10 to 5 takes you from *usually available* to *worse than a coin flip*.
There is no correct answer to how long the list should be — but there is now a
number attached to the choice, which is what the maths bought you.

### 3.6 Structure and house style

`##` and `###` only, never skipping a level — they build the table of contents.
Target 1,100–1,500 words. Second person, present tense. Lead with the concrete
poll, not with the definition of a hypergeometric distribution; the name can
arrive in the third section, once the reader has already computed with it.

Suggested outline:

```
(intro — the poll: 35 options, 10 on your list, 4 shown, pick 1)
## Counting the ways a poll can come out
## None of your list shows up
### Checking it a second way                  ← sequential draw
## Exactly one
## At least one — the shortcut
<Quiz>                                         ← mid-lesson, conceptual
## The whole picture
### How many to expect
## Across several polls
### Why this one is a different distribution   ← the transferable idea
## How long should the list be?
<Quiz>                                         ← end, computational
## Where to go next
```

"Where to go next" points at the 100-question practice set and at
`describing-data` in Statistics.

Both `<Quiz>` blocks need an `explanation` on **every** choice, wrong ones
included — that is where the teaching happens. Suggested pair:

- Mid-lesson, conceptual: *why isn't this binomial?* Correct answer names the
  shrinking denominator; distractors are "because 4 < 35", "because the options
  are weighted", "because we only pick 1 of the 4".
- End, computational: recompute $P(X \ge 1)$ for a 6-option priority list
  (54.639%), so the reader exercises the complement rule on fresh numbers.

### 3.7 Notation and locale rules

- KaTeX renders at build time; an unsupported macro **fails the build**, which
  is desired. `\dbinom` and `\binom` are both supported.
- Inside a Markdown table cell use `\dfrac`, never `\frac`.
- Indonesian prose: comma for decimals, full stop for thousands — `24,160%`,
  `52.360 kemungkinan`. Inside `$…$` write `24{,}160` and `52{,}360` (a bare
  comma is spaced as punctuation). English prose takes the reverse.
- Keep the Indonesian terms readers meet at school: *peluang*, *kombinasi*,
  *permutasi*, *rata-rata*, *simpangan baku*, *tanpa pengembalian*. Use
  *polling* and *opsi* as the loanwords they already are; do not invent a
  translation for *hipergeometrik*.

---

## 4. New tags

Two keys are missing from the registry. Add them to `content/tags.json`
**before** using them — the build fails on an unregistered tag, deliberately.

```json
"combinatorics": { "group": "mathematics", "id": "Kombinatorika", "en": "Combinatorics" },
"polling":       { "group": "statistics",  "id": "Polling",       "en": "Polling" }
```

Then add a row for each to the matching table in `docs/TAGS.md` and update
"Currently **30 tags**" to 32. Use-it-for column:

- `combinatorics` — counting: combinations, permutations, how many ways an
  outcome can happen.
- `polling` — polls, ballots, option pools, and how their results are read.

`distributions` already exists and is a defensible fifth tag, since the lesson
introduces a named distribution. Three to five is the guideline; four is
specified in §3.1. Adding `distributions` is fine, but then both locales must
carry it.

---

## 5. Manifest changes

`content/id/modules/mathematics.json` and `content/en/modules/mathematics.json`,
identical position in both:

```diff
-  "lessons": ["percentages-and-proportions"],
+  "lessons": ["percentages-and-proportions", "probability-in-polling"],
```

`plannedLessons` is untouched — this slug was never on that roadmap, so there is
no entry to move out. (The validator fails if a slug appears in both arrays.)
Do not touch `order`, and do not touch the Statistics manifest.

---

## 6. The practice bank

### 6.1 Location and shape

```
content/<locale>/practice/<set>.json
```

```jsonc
{
  "set": "probability-in-polling",
  "title": "Peluang opsi prioritas — 100 soal latihan",
  "description": "One sentence. Shown on the practice index and as the page meta description.",
  "lesson": "probability-in-polling",
  "updated": "2026-08-21",
  "items": [
    {
      "id": "pip-b-03",
      "family": "b",
      "level": "basic",
      "params": { "model": "hypergeometric", "N": 35, "K": 10, "n": 4, "k": 0, "quantity": "eq" },
      "question": "Sebuah polling menampilkan 4 opsi dari kumpulan 35 opsi, dan 10 di antaranya ada di daftar prioritasmu. Berapa peluang tidak satu pun opsi prioritas muncul?",
      "choices": [
        { "text": "$\\dfrac{115}{476} \\approx 24{,}16\\%$", "correct": true, "explanation": "…" },
        { "text": "$\\dfrac{361}{476} \\approx 75{,}84\\%$", "explanation": "Ini peluang *setidaknya satu* muncul — komplemennya." },
        { "text": "$\\left(\\dfrac{25}{35}\\right)^4 \\approx 26{,}03\\%$", "explanation": "Ini model dengan pengembalian…" },
        { "text": "$\\dfrac{25}{35} \\approx 71{,}43\\%$", "explanation": "Ini hanya undian pertama…" }
      ],
      "solution": "Worked steps, 2–4 sentences, KaTeX allowed."
    }
  ]
}
```

`choices` deliberately mirrors `QuizChoice` in `src/components/quiz.tsx` so the
two share a type. Rules per item:

- `id` — unique within the set, lowercase kebab-case, **identical set of ids in
  both locales**. Ids are how a seeded sample stays comparable between
  languages; the validator fails on any mismatch.
- `params` — **required for every numeric item.** This is what makes the bank
  self-verifying (§9.2). Conceptual items omit it and carry
  `"verify": false` instead.
- Exactly one `correct: true` unless the item is deliberately multi-answer, in
  which case it needs `"multiple": true`.
- **Every** choice carries an `explanation`, wrong ones included.
- `solution` is required — the worked derivation, see §6.4.
- `level` is one of `basic | intermediate | advanced`.

### 6.2 The 100 items

Ten families, each drilling one idea from §3. Keep the counts — they are
balanced so no family is thin enough to memorise and none dominates a
20-question draw.

| Family | Drills | Count | Level mix |
| --- | --- | --- | --- |
| `a` | Size of the draw space: $\binom{N}{n}$, and why it is a combination not a permutation | 10 | 7 basic, 3 intermediate |
| `b` | $P(X=0)$ — none of the list appears | 12 | 9 basic, 3 intermediate |
| `c` | $P(X=1)$ — exactly one | 12 | 7 basic, 5 intermediate |
| `d` | $P(X \ge 1)$ via the complement | 12 | 8 basic, 4 intermediate |
| `e` | General $P(X=k)$, $P(X \ge 2)$, $P(X \le 1)$, full-table reading | 12 | 6 intermediate, 6 advanced |
| `f` | $E[X]$, variance, sd, most likely value | 10 | 5 intermediate, 5 advanced |
| `g` | Sequential-draw verification — the shrinking denominator | 8 | 4 basic, 4 intermediate |
| `h` | Across $m$ independent polls: $P(X=0)^m$, at least one hit in $m$, expected polls until a hit | 12 | 6 intermediate, 6 advanced |
| `i` | Sensitivity: vary $K$, $N$, or $n$ and say which way the answer moves | 8 | 4 intermediate, 4 advanced |
| `j` | Interpretation, no arithmetic: with vs without replacement, dependence within a poll vs independence across polls, ratio ≠ probability, what the model assumes | 6 | 3 basic, 3 intermediate |
| | | **100** | |

Vary the surface so a reader cannot pattern-match on the scenario: a song
shuffle drawing 3 of 40, a raffle showing 5 of 60, a quiz app serving 4 of 28,
a menu rotating 6 of 50, a card draw. **Keep the 35/10/4 case as the anchor for
family `b` and `d`** so the practice connects visibly to the lesson, and vary
everywhere else. Constraints: $N \in [12, 80]$, $K \in [2, N-2]$,
$n \in [2, 8]$, $n \le N-K$ where the family needs $P(X=0) > 0$.

### 6.3 How to produce 100 correct items

**Do not hand-write 100 numeric answers.** §0.1 is the evidence. Write
`scripts/generate-practice.mjs`:

1. One template per family, carrying hand-written prose (per locale) with
   `{{N}}`, `{{K}}`, `{{n}}`, `{{k}}`, `{{m}}` placeholders, plus a
   hand-written explanation string per choice slot.
2. **Exact arithmetic only.** Binomial coefficients via `BigInt`, probabilities
   as reduced `BigInt` fractions, decimals derived at the end for display.
   Floating-point `comb()` overflows and rounds; the whole point of this bank
   is that its answers are right.
3. Distractors come from *named misconceptions*, never random noise. For the
   $P(X=0)$ family the four choices are: the correct
   $\binom{N-K}{n}/\binom{N}{n}$; its complement (confused "none" with "at
   least one"); $\left(\frac{N-K}{N}\right)^{n}$ (used **with** replacement);
   and $\frac{N-K}{N}$ (stopped after the first draw). Each distractor's
   `explanation` names its misconception. **That is what makes a generated bank
   teach rather than merely test.**
4. Deterministic: fixed seed, fixed parameter table, so re-running reproduces
   the committed JSON byte for byte.
5. Locale-aware number formatting per §3.7 — the `id` and `en` files differ in
   decimal separator and prose, never in `id`, `family`, `level`, `params`, or
   which choice is correct.
6. Shuffle the correct answer's position per item (seeded) so it is not always
   choice A.
7. Emit `params` on every numeric item so the validator can re-derive the
   answer independently (§9.2).
8. Commit the generator **and** its output. The JSON is the content; the
   generator is how it stays maintainable.

The six `j` items are hand-written — they are prose judgements and a template
would produce filler.

Add `"generate:practice": "node scripts/generate-practice.mjs"` to
`package.json`. It is not part of `npm run check`; it is run deliberately and
its output reviewed.

### 6.4 What a good explanation looks like

The `solution` states the rule, substitutes, evaluates — in that order, in two
to four sentences. It never says "as shown above" and never restates the
question.

> Of the 35 options, 25 are off your list, so the draws that miss it entirely
> are the $\binom{25}{4} = 12{,}650$ ways to choose 4 from those 25, out of
> $\binom{35}{4} = 52{,}360$ total. That is $115/476 \approx 24{,}16\%$. The
> same answer falls out of the sequential form
> $\frac{25}{35}\cdot\frac{24}{34}\cdot\frac{23}{33}\cdot\frac{22}{32}$ — note
> every denominator shrinks, because an option once shown is gone.

Per-choice `explanation` on a wrong answer names the specific error that leads
there. "Incorrect" is not an explanation.

---

## 7. The test page

### 7.1 Routes

```
src/app/[locale]/practice/page.tsx            index — every set, with item counts
src/app/[locale]/practice/[set]/page.tsx      the test itself
src/components/practice-test.tsx              "use client" — the whole interaction
```

Both pages are server components with `generateStaticParams` over
`locales × sets`, `generateMetadata` with `alternates.languages` for every
locale (copy the shape from `src/app/[locale]/lessons/[lesson]/page.tsx`), and
`notFound()` on an unknown locale or set. Import `katex/dist/katex.min.css` on
the `[set]` page — the same line the lesson page carries — because items arrive
as pre-rendered KaTeX HTML.

### 7.2 What the server passes down

The server page calls `getPracticeSet(locale, set)` and hands the client
component an array in which `question`, `solution`, and every `choice.text`
have already been through `renderMathToHtml` (§8.2). The client renders those
with `dangerouslySetInnerHTML` — safe here for exactly the reason
`blockJS: false` is safe in `src/components/mdx.tsx`: content is authored in
this repo, never submitted by a user. Put that reasoning in a comment so the
next reader need not rediscover it.

Strip `params` before it crosses to the client — it is build-time verification
metadata and shipping it just bloats the payload.

### 7.3 Interaction

Three states: `setup → running → review`.

**setup** — the count picker. Presets `10 · 20 · 50 · Semua`, plus a number
input clamped to `1..items.length`, defaulting to 20. One primary "Start"
button. This is the state the static HTML is prerendered in, so it must render
identically on server and client.

**running** — one question at a time. Header shows `Soal 7 / 20` and a progress
bar. Choices are buttons with `aria-pressed`, styled exactly like
`src/components/quiz.tsx` so the two feel like one product — reuse its colour
logic (`#16a34a` correct, `#dc2626` wrong, `var(--accent)` selected). Answering
reveals correctness and the relevant explanations immediately, then "Next". No
going back — this is a test, not a worksheet.

**review** — score with `aria-live="polite"` (the `quizScore` key already exists
in the dictionary, unused, waiting for exactly this), the seed that produced the
set, then every question with the reader's answer, the correct answer, and the
full `solution`. Two actions: "Retake this set" (same seed) and "New random
set" (new seed, back to setup).

A per-family score breakdown in review is a cheap, high-value addition — it
tells the reader *which idea* they are missing rather than just a number.
Optional; flag it rather than assuming it.

### 7.4 Randomness without a hydration bug

The one place a careless implementation breaks the build's guarantees.

- **Never shuffle during render.** Prerendered HTML contains the setup screen
  only. The sample is drawn in the click handler on "Start".
- **Seeded PRNG**, not bare `Math.random()` in the shuffle. `mulberry32` in
  ~5 lines, Fisher–Yates driven by it. The seed is drawn once — from `?seed=`
  if present, else `Math.floor(Math.random() * 2 ** 32)` — inside the handler,
  and surfaced in review so a set can be reproduced or shared.
- Reading `?seed=` means `useSearchParams()`, which needs a `<Suspense>`
  boundary in a statically prerendered route. Wrap the client component.
- No `localStorage` / `sessionStorage` / cookies. State dies with the tab, by
  design.

### 7.5 i18n keys

Add to the `Dict` type and **both** dictionaries in `src/lib/i18n.ts` — the
typecheck fails until both are complete, which is the point.

`practice`, `practiceIntro`, `practiceSets`, `chooseCount`, `allQuestions`,
`startTest`, `questionLabel`, `ofLabel`, `submitAnswer`, `nextQuestion`,
`finishTest`, `yourScore`, `reviewAnswers`, `retakeSet`, `newRandomSet`,
`showSolution`, `hideSolution`, `yourAnswer`, `correctAnswer`, `seedLabel`,
`takeTheTest`, `questionsAvailable`.

`quizScore` already exists — use it, do not add a synonym.

Indonesian is written as Indonesian, not translated: `Latihan`, `Mulai tes`,
`Soal`, `dari`, `Skor kamu`, `Ulangi set ini`, `Set acak baru`,
`Lihat pembahasan`, `Jawabanmu`, `Jawaban benar`.

### 7.6 Wiring it in

- **Lesson → test.** The lesson page reads `practiceSet` from frontmatter and,
  when present, renders a card above the previous/next nav linking to
  `/<locale>/practice/<set>` with the item count and `copy.takeTheTest`.
- **Module page → test.** Leave alone. It lists lessons; a second kind of row
  muddies it.
- **Header nav.** Add `{ href: /${locale}/practice, label: copy.practice }`
  between Topics and Search in `src/components/site-header.tsx`. Optional, and
  the one change here that touches every page — flag it in the PR rather than
  burying it.
- **Sitemap.** Add `/<locale>/practice` and each `/<locale>/practice/<set>` in
  `src/app/sitemap.ts`, `changeFrequency: "monthly"`, priority `0.5` and `0.6`.
- **Search index.** Do **not** add practice items to `getSearchIndex` — 100
  short questions per locale would swamp seven lessons. Adding the set *page*
  as a single document is acceptable if wanted; default to leaving it out.

---

## 8. Content-layer changes

`src/lib/content.ts` stays the only module that touches disk (`AGENTS.md`
rule 5). Everything below goes there.

### 8.1 New exports

```ts
export type PracticeChoice = { text: string; correct?: boolean; explanation?: string };

export type PracticeItem = {
  id: string;
  family: string;
  level: Level;
  question: string;
  choices: PracticeChoice[];
  solution: string;
  multiple?: boolean;
};

export type PracticeSet = {
  set: string;
  locale: Locale;
  title: string;
  description: string;
  lesson: string | null;
  updated: string | null;
  items: PracticeItem[];
};

export function getPracticeSet(locale: Locale, set: string): PracticeSet | null;
export function getPracticeSets(locale: Locale): PracticeSet[];
export function getAllPracticeParams(): { locale: Locale; set: string }[];
export function getPracticeSetForLesson(locale: Locale, lessonSlug: string): PracticeSet | null;
```

Cache per locale in a `Map`, exactly like `loadLessons`. `params` is read by the
validator from the raw JSON and is deliberately absent from `PracticeItem`.

### 8.2 Build-time maths rendering

```ts
import katex from "katex";

/**
 * Render $inline$ and $$display$$ to HTML at build time. Practice items are
 * data, not MDX, so they never pass through the rehype pipeline — but they
 * still need notation. Doing it here keeps KaTeX out of the browser bundle.
 */
export function renderMathToHtml(source: string): string;
```

Escape the non-maths segments as HTML before splicing (`&`, `<`, `>`), split on
`$$…$$` first and `$…$` second, and call
`katex.renderToString(tex, { displayMode, throwOnError: true, strict: false })`.
**`throwOnError: true` is deliberate** — a malformed formula in an item should
break the build, matching how the lesson pipeline treats bad KaTeX.

Apply it inside `getPracticeSet` so callers receive render-ready HTML and no
component has to know about it.

---

## 9. Validator changes

Extend `scripts/check-content.mjs`. Same conventions: `fail()` for anything
that breaks a page or a link, `warn()` for anything a human should look at.

### 9.1 Structural checks

Per locale, for every `content/<locale>/practice/*.json`:

- **fail** — invalid JSON; missing `set`, `title`, `items`; `set` not matching
  the filename; `items` empty.
- **fail** — an item missing `id`, `question`, `choices`, or `solution`.
- **fail** — an `id` that is not lowercase kebab-case, or duplicated in the set.
- **fail** — no choice marked `correct`; or more than one without
  `"multiple": true`.
- **fail** — a choice with no `explanation`. This is the rule that keeps the
  bank teaching rather than merely testing.
- **fail** — an odd number of unescaped `$` in `question` or `solution` — an
  unterminated formula, which would otherwise fail much later in `next build`.
- **fail** — `lesson` naming a slug with no lesson file in that locale.
- **fail** — a lesson whose `practiceSet` frontmatter names a set that does not
  exist in that locale (the reverse check).
- **fail** — the set of item `id`s differs between `id` and `en`. Lessons may
  lag in translation; a test cannot, because both locales must sample the same
  questions.
- **fail** — the `correct` index differs between locales for the same item id.
- **warn** — a family with fewer than 4 items, or a level absent entirely.

### 9.2 Answer verification — the important one

For every item carrying `params`, recompute the answer from scratch with exact
`BigInt` arithmetic and **fail if it disagrees with the choice marked
`correct`**. Parse the correct choice's `text` for its numeric value (the
generator emits a canonical `a/b` fraction plus a percentage, so this is a
regex, not a maths parser — keep that format contractual).

Supported `params.model` / `quantity` pairs, all closed-form:

| `quantity` | Computes |
| --- | --- |
| `eq` | $P(X=k)$ |
| `ge` | $P(X \ge k)$ |
| `le` | $P(X \le k)$ |
| `none-over-m` | $P(X=0)^{m}$ |
| `any-over-m` | $1 - P(X=0)^{m}$ |
| `mean` | $nK/N$ |
| `var` | $n\frac{K}{N}(1-\frac{K}{N})\frac{N-n}{N-1}$ |
| `space` | $\binom{N}{n}$ |

Items with `"verify": false` (the six conceptual ones) are skipped, and the
validator **fails if more than 10 items opt out** — the escape hatch must not
become the norm.

This is roughly 60 lines and it is the reason this bank can be trusted at 100
items when a careful human got 3 of 13 figures wrong in §0.1.

### 9.3 Summary line

Update the line at the bottom to include practice sets and verified items:

```
4 modules · 16 lessons across 2 locales · 32 tags · 2 practice sets · 200 items (188 verified) · 0 errors · 0 warnings
```

---

## 10. Docs and release bookkeeping

| File | Change |
| --- | --- |
| `docs/CONTENT.md` | New "Practice sets" section: file location, item schema, `params`, the explanation rule, and that the generator — not a human — writes numeric items. |
| `docs/ARCHITECTURE.md` | Add `practice/` to the directory map, the two new routes, and a line in the rendering-pipeline section on build-time KaTeX for non-MDX content. |
| `docs/TAGS.md` | Two rows (§4) and the tag count. |
| `docs/plans/archive/mathematics-and-statistics.md` | Under "Open questions", replace the exercises question with the answer — a separate practice bank, decided here — and link to this file. |
| `CHANGELOG.md` | An entry under `## [Unreleased]` in **every** commit touching user-visible behaviour (`AGENTS.md` rule 7). |
| `package.json` | Add `generate:practice`. Do **not** bump `version` — releasing is its own commit per `docs/VERSIONING.md`. |

When released this is a **MINOR** bump (new page, new content type, new
lesson) — `0.3.0` — following `docs/VERSIONING.md`.

---

## 11. Build order

Four commits, each green on `npm run check` and `npm run build` on its own.
The order matters: the validator's cross-references fail a naive ordering
halfway through.

**C1 — tags and the lesson**
Both tags in `content/tags.json` and `docs/TAGS.md`. Both lesson files. The slug
into both manifests. **Omit `practiceSet` from frontmatter for now** — the bank
does not exist yet and the reverse check would fail. CHANGELOG entry.

> `Add a probability lesson on prioritized options in polling`

**C2 — the practice bank**
`scripts/generate-practice.mjs`, both JSON files, the `generate:practice`
script, and the validator extension including §9.2. Still no route — the bank
is valid content on its own. CHANGELOG entry.

> `Add a 100-question practice bank for probability in polling`

**C3 — the test page**
Content-layer exports, `renderMathToHtml`, both routes, the client component,
the i18n keys, sitemap entries, the header link, and **now** `practiceSet` in
the lesson frontmatter plus the CTA on the lesson page. CHANGELOG entry.

> `Add practice sets with a randomised test page`

**C4 — docs**
`CONTENT.md`, `ARCHITECTURE.md`, the plan update, and consolidate
`[Unreleased]`.

> `Document practice sets`

Commit format is non-negotiable — imperative summary under 72 characters, no
trailing period, no `feat:` prefix, blank line, `*` bullets, blank line,
`Co-Authored-By:` trailer since an agent did the work. Full rules in
`docs/WORKFLOW.md`. Branch: `content/probability-in-polling`.

---

## 12. Definition of done

- [ ] `npm run check` — zero errors. New warnings only if deliberate and noted.
- [ ] `npm run build` — completes; every new page prerenders.
- [ ] `/id/lessons/probability-in-polling` and `/en/lessons/probability-in-polling`
      both render, KaTeX typeset, both quizzes interactive.
- [ ] The language switcher moves between them without a 404.
- [ ] **The lesson's numbers match §0.1 exactly**, including the three corrected
      sensitivity figures (66.482% / 54.639% / 47.660%) and the reduced
      $3/748$.
- [ ] 100 items in each locale, with identical `id` sets and identical correct
      answers.
- [ ] At least 90 items carry `params` and pass §9.2 verification.
- [ ] Every item has a `solution` and an `explanation` on every choice.
- [ ] `/id/practice/probability-in-polling` loads, picks 20 at random, scores,
      and reviews — with no hydration warning in the console.
- [ ] Two runs with the same seed give the same questions in the same order;
      two runs without give different ones.
- [ ] No `localStorage` / `sessionStorage` anywhere in the new code.
- [ ] `npm ls --depth=0` unchanged — no new dependency.
- [ ] No existing slug renamed; no redirect needed.
- [ ] `CHANGELOG.md` updated under `[Unreleased]`.

---

## 13. Open questions for Amalia

1. **The real system's assumptions.** The whole lesson rests on "all 35 equally
   likely, 4 distinct, polls independent". If the actual poll weights options,
   or avoids repeating an option across consecutive polls, the numbers change
   and the lesson should say which assumption it is idealising. Worth one
   sentence from you.
2. **Header nav.** Add "Latihan / Practice" as a fourth top-level nav item, or
   keep practice reachable only from the lesson it drills? §7.6 assumes yes;
   one-line revert.
3. **Per-family score breakdown** in the review screen (§7.3) — build it now or
   leave it?
4. **Cross-listing.** Statistics still plans its own `probability-basics`. If
   that is being dropped in favour of this lesson, say so — the decision in §2
   flips and `primaryModule: mathematics` becomes required frontmatter.
