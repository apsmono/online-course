# Plan — Mathematics and Statistics modules

**Status:** in progress. Structure, tags, and one lesson per module are done; the
rest of the outline is written but unpublished.

## Who these are for

Adults who did this at school, passed the exam, and retained nothing usable. Not
students revising for an exam, and not people who want a formal course. The test
for every lesson is: *does this let someone do something they could not do
yesterday, or see through something that would have fooled them?*

That framing drives the ordering. Percentages come before algebra because
percentages are what people are actually confused by this week.

## Current state

| Module | Order | Written | Planned |
| --- | --- | --- | --- |
| Mathematics | 3 | 1 | 10 |
| Statistics | 4 | 2 (one shared) | 9 |

Written: `percentages-and-proportions` (Mathematics, cross-listed into
Statistics) and `describing-data` (Statistics). Both exist in `id` and `en`.

## Mathematics — full outline

| # | Slug | Title | Level |
| --- | --- | --- | --- |
| 1 | `percentages-and-proportions` | Percentages and proportions | basic ✅ |
| 2 | `order-of-operations` | Order of operations and why it is a convention | basic |
| 3 | `fractions-and-decimals` | Fractions, decimals, and moving between them | basic |
| 4 | `algebra-basics` | Variables and solving your first equations | basic |
| 5 | `linear-equations` | Lines, slope, and systems of equations | intermediate |
| 6 | `functions-and-graphs` | Functions and reading a graph | intermediate |
| 7 | `exponents-and-logarithms` | Exponents, logarithms, and growth | intermediate |
| 8 | `sequences-and-series` | Sequences, series, and compounding | intermediate |
| 9 | `introduction-to-proof` | What a proof is and how to read one | advanced |
| 10 | `limits-and-derivatives` | Limits and derivatives without the hand-waving | advanced |
| 11 | `matrices-and-vectors` | Matrices and vectors as a language for data | advanced |

Angles worth keeping:

- **`order-of-operations`** — lead with the fact that PEMDAS/BODMAS is a
  *notational convention*, not a law of arithmetic. That reframing is the lesson.
- **`exponents-and-logarithms`** — anchor in compound interest and in log scales
  on charts, which is where non-mathematicians meet logarithms in the wild.
- **`sequences-and-series`** — the honest treatment of "the miracle of compound
  interest", including how it works against you on a loan.
- **`limits-and-derivatives`** — a derivative is an instantaneous rate. Speedometers
  before epsilon-delta.

## Statistics — full outline

| # | Slug | Title | Level |
| --- | --- | --- | --- |
| 1 | `what-statistics-is-for` | What statistics is actually for | basic |
| 2 | `describing-data` | Describing data — centre and spread | basic ✅ |
| 3 | `charts-that-do-not-lie` | Charts that do not lie | basic |
| 4 | `probability-basics` | Probability from first principles | intermediate |
| 5 | `distributions` | Distributions and the normal curve | intermediate |
| 6 | `sampling-and-uncertainty` | Sampling, error bars, and confidence intervals | intermediate |
| 7 | `correlation-and-causation` | Correlation, causation, and confounders | intermediate |
| 8 | `hypothesis-testing` | Hypothesis testing and what a p-value is not | advanced |
| 9 | `regression` | Regression as a model of a relationship | advanced |
| 10 | `bayesian-thinking` | Bayesian thinking and updating on evidence | advanced |

Angles worth keeping:

- **`charts-that-do-not-lie`** — truncated axes, dual axes, area-vs-radius, and
  why a pie chart with nine slices is a failure. Needs images; budget time for
  them.
- **`probability-basics`** — the Monty Hall problem and the base-rate fallacy in
  medical testing. Both are famous because they are genuinely counter-intuitive.
- **`hypothesis-testing`** — the lesson is what a p-value is *not*. Most readers
  arrive believing it is the probability the hypothesis is false.
- **`bayesian-thinking`** — connects back to the decision journal in
  `deliberate-practice`. Cross-linking, not cross-listing.

## Cross-listing decisions

Applying the test in `docs/CONTENT.md` — *would a reader of either module miss it?*

| Lesson | Modules | Reasoning |
| --- | --- | --- |
| `percentages-and-proportions` | Mathematics + Statistics ✅ | Arithmetic can't skip it; nobody reads a statistic without it. Genuinely core to both. |
| `probability-basics` | Mathematics + Statistics | Probability is a branch of mathematics and the foundation of inference. Cross-list when written; primary = Statistics. |
| `functions-and-graphs` | Mathematics only | Statistics needs graph-reading, not function theory. Link from `charts-that-do-not-lie`. |
| `matrices-and-vectors` | Mathematics only | Regression uses matrices, but a reader of `regression` does not need them. Link. |
| `data-literacy` lessons | tagged, not cross-listed | `data-literacy` is a cross-cutting tag. That is what tags are for. |

Nothing should end up in three modules. If it looks like it should, it is
probably two lessons.

## Writing order

Bottom-up within each module, alternating between the two so neither stalls:

1. `what-statistics-is-for` — the module currently opens on lesson 2
2. `order-of-operations`
3. `charts-that-do-not-lie` — needs diagrams
4. `fractions-and-decimals`
5. `probability-basics` — first cross-listed lesson, exercises `primaryModule`
6. `algebra-basics`
7. …then intermediate, then advanced

Each lesson ships as one commit containing both locales, the manifest move from
`plannedLessons` into `lessons`, and a `CHANGELOG.md` entry.

## Conventions specific to these modules

- **Notation.** KaTeX renders at build time. Inside table cells use `\dfrac` so
  fractions stay display-sized. Check anything unusual against
  [KaTeX's supported functions](https://katex.org/docs/supported.html) — an
  unsupported macro fails the build, which is the desired behaviour.
- **Decimal separators.** Indonesian prose uses a comma for decimals and a full
  stop for thousands (`18,5%`, `80.000`). English prose uses the reverse. This
  applies inside `$…$` too — write `18{,}5` in KaTeX for Indonesian, since a bare
  comma gets spacing as punctuation.
- **Terminology.** Keep the Indonesian terms readers meet in school: *rata-rata*,
  *median*, *modus*, *simpangan baku*, *ragam*, *pencilan*, *peluang*. Do not
  invent translations for terms that are already loanwords in Indonesian
  statistical usage.
- **Worked examples over notation.** Every formula gets a worked numeric example
  in the same section. A formula alone teaches nobody.
- **Tags.** Broad tag (`mathematics` / `statistics`) plus the specific one, plus
  `data-literacy` where the lesson genuinely helps someone not be misled. All the
  keys are already registered — see `docs/TAGS.md`.

## Images

`charts-that-do-not-lie` and `distributions` need figures. There is no image
pipeline yet. Options, cheapest first:

1. Inline SVG in the MDX — version-controlled, themeable, no build step. Best for
   schematic diagrams.
2. Generated PNGs committed to `public/` — fine for real plots; regenerate with a
   script kept next to them.
3. A chart component — only if figures become routine. Do not build it for two
   lessons.

Decide when the first figure is actually needed, not before.

## Open questions

- Should exercises with worked solutions exist as a separate component, or does
  `<Quiz>` cover it? Quizzes suit conceptual checks; multi-step computation may
  want a collapsible worked solution instead.
- Do the advanced lessons need prerequisites listed explicitly, or is manifest
  order enough? Manifest order is enough while lessons stay in one module — it
  stops being enough as soon as cross-listing spreads.
