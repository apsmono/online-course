# Tag registry

The canonical list. Every key here is a URL at `/<locale>/topics/<key>` and the
only thing `tags:` frontmatter may contain. Labels are what readers see.

**Adding a tag:** add it to `content/tags.json`, add a row here, then use it. The
build fails on an unregistered tag, which is deliberate — it stops the taxonomy
drifting into forty near-synonyms.

**Renaming a tag:** don't. The key is a live URL. If it is unavoidable, add a
redirect in `next.config.ts` in the same commit.

**How many per lesson:** three to five. One broad (the field), one specific (the
sub-topic), optionally one cross-cutting.

Currently **30 tags** in **4 groups**.

## Web — `web`

| Key | Bahasa Indonesia | English | Use it for |
| --- | --- | --- | --- |
| `web` | Web | Web | Anything about the web platform itself. Broad — pair it with a specific tag. |
| `http` | HTTP | HTTP | Requests, responses, status codes, headers, caching. |
| `networking` | Jaringan | Networking | DNS, TCP, TLS, latency — the layers under HTTP. |
| `html` | HTML | HTML | Markup, semantics, document structure, forms. |
| `css` | CSS | CSS | Styling, cascade, specificity, custom properties. |
| `layout` | Tata Letak | Layout | Flexbox, Grid, positioning, responsive behaviour. |
| `accessibility` | Aksesibilitas | Accessibility | Screen readers, keyboard access, contrast, WCAG. Cross-cutting — use it on any lesson that materially affects assistive technology. |

## Learning — `learning`

| Key | Bahasa Indonesia | English | Use it for |
| --- | --- | --- | --- |
| `learning` | Belajar | Learning | Broad tag for the study-technique material. |
| `memory` | Memori | Memory | Retention, recall, forgetting curves, spaced repetition. |
| `study-skills` | Metode Belajar | Study Skills | Concrete techniques: note-taking, interleaving, self-testing. |
| `practice` | Latihan | Practice | Skill acquisition, drills, deliberate practice. |
| `feedback` | Umpan Balik | Feedback | Feedback loops, decision journals, kind vs wicked environments. |

## Mathematics — `mathematics`

| Key | Bahasa Indonesia | English | Use it for |
| --- | --- | --- | --- |
| `mathematics` | Matematika | Mathematics | Broad tag for the maths module. |
| `arithmetic` | Aritmetika | Arithmetic | Numbers, operations, fractions, percentages, estimation. |
| `algebra` | Aljabar | Algebra | Variables, expressions, equations, manipulation. |
| `functions` | Fungsi | Functions | Functions, graphs, transformations, domain and range. |
| `geometry` | Geometri | Geometry | Shape, distance, area, trigonometry. |
| `calculus` | Kalkulus | Calculus | Limits, derivatives, integrals, rates of change. |
| `linear-algebra` | Aljabar Linear | Linear Algebra | Vectors, matrices, transformations. |
| `proof` | Pembuktian | Proof | Logic, proof technique, mathematical argument. |

## Statistics — `statistics`

| Key | Bahasa Indonesia | English | Use it for |
| --- | --- | --- | --- |
| `statistics` | Statistika | Statistics | Broad tag for the statistics module. |
| `descriptive-statistics` | Statistika Deskriptif | Descriptive Statistics | Mean, median, spread, shape — summarising data you have. |
| `probability` | Peluang | Probability | Chance, independence, conditional probability, expectation. |
| `distributions` | Distribusi | Distributions | Normal, binomial, Poisson, and reading a distribution. |
| `sampling` | Pengambilan Sampel | Sampling | Samples, populations, bias, standard error. |
| `inference` | Inferensi | Inference | Drawing conclusions beyond the data in hand. |
| `hypothesis-testing` | Uji Hipotesis | Hypothesis Testing | Null hypotheses, p-values, significance, errors. |
| `regression` | Regresi | Regression | Modelling relationships between variables. |
| `data-visualisation` | Visualisasi Data | Data Visualisation | Charts, axes, and how visuals mislead. |
| `data-literacy` | Melek Data | Data Literacy | Reading numbers critically in the wild. Cross-cutting — use it on any lesson that helps someone not be fooled by a statistic. |

## Cross-cutting tags

Two tags deliberately span groups and may be applied to any lesson they genuinely
fit:

- **`accessibility`** — the lesson materially changes how the work behaves for
  someone using assistive technology.
- **`data-literacy`** — the lesson helps a reader avoid being misled by a number.
  This is why `percentages-and-proportions` carries it despite living in
  Mathematics.

Do not apply either as a courtesy. A tag page that lists everything lists nothing.

## Reserved but unused

Tags registered ahead of the lessons that will use them appear as a warning in
`npm run check:content`. That is expected while the Mathematics and Statistics
roadmaps are being written — see `docs/plans/mathematics-and-statistics.md`. An
*unexpected* name in that warning means a typo somewhere.
