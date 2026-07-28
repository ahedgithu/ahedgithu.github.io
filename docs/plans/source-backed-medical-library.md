# Source-backed MCQ explanations and medical library

Status: approved for local implementation on `codex/source-backed-library`
Source: `C:\Users\ahmed\Downloads\MUST401_GIT_Interactive_Study_Platform.html`
Source SHA-256: `36CA1A86B9C4E1E1D0F42F8D90858F2D72584DD2BCC53BEECEB69ED97A0C3688`

## Product decision

Build a small read-only source layer inside the existing MED 401 tracker. It
supports the quiz instead of becoming another study application.

The supplied HTML already contains the topics. “Extraction” here means a
deterministic conversion of its existing topic, section, passage, and image
records into maintainable local data. It does **not** mean rediscovering,
rewriting, or summarizing the medical topics.

Use local canonical content and generated static bundles first. Keep Supabase
for authentication and progress. Consider a Supabase content workflow only
after the library grows enough to require browser-based editorial review.

## Current-state findings

- The site is a plain-JavaScript Vite application. Tracker search, quiz state,
  answer feedback, and modal behavior are concentrated in `src/main.js`.
- Shared runtime files are mirrored under `public/src/`; both copies must stay
  byte-identical.
- MCQs have stable IDs and already support an explanation and a human-readable
  source label. Those IDs and existing progress keys must not change.
- The tracker search already has `Topics` and `MCQs` modes. A third `Sources`
  mode fits the current information architecture better than a new navigation
  destination.
- The quiz uses one dialog and keeps its active state in memory. A source
  reader should be a view within that dialog, not a nested modal.
- The existing `/study/` prototype is a separate Acute/Chronic Pancreatitis
  mini-library. Preserve it during this implementation; do not silently
  rewrite or delete it.
- Current service-worker code removes old caches, so offline/PWA behavior is
  not an active architectural constraint in this release. Static content still
  leaves a clean path to future offline caching.
- The supplied HTML contains one Gastroenterology source set with 6 existing
  topics, 37 sections, 82 source-page blocks (about 16,275 words), and 6
  embedded WebP images.

## Preserve and remove

Preserve as source data:

- Existing subject/topic/section hierarchy, labels, categories, and keywords.
- Exact source-page text and page ordering.
- Stable source section identifiers where present.
- The six embedded lecture images, extracted to content-addressed files.
- Structured tables or summaries only as non-authoritative candidate material
  until every claim is traced to source passages.

Do not reproduce in the MED 401 website:

- The supplied dashboard, sidebar, study/revision mode, locked/reveal flow,
  completion state, confidence state, bookmarks, recent visits, or daily
  prompts.
- Professor-avatar presentation, automatic Arabic/English explanation layer,
  self-check reveal cards, fullscreen/focus workspace, or print controls.
- Any script, style, state machine, or raw imported HTML from the old study
  experience.

## Student experience

### After answering an MCQ

Show a compact block beneath the active question:

1. Correct/incorrect status.
2. “Why the correct answer is right.”
3. If the student was wrong, “Why your answer is wrong.”
4. A short `Subject › Topic › Section` breadcrumb.
5. `Open source` only when a reviewed citation resolves to a real passage.

Do not display all distractor rationales by default. If a question has no
published evidence record, keep the existing explanation UI and do not imply
that it is source-backed.

### Source reader

- Reuse the quiz dialog.
- Desktop: question and source can form a split view when space allows.
- Mobile: the source becomes a full-width subview with `Back to question`.
- Jump to the exact cited passage and briefly highlight it.
- Preserve question index, selected answer, score, timer, dialog scroll, and
  persisted progress while the reader opens and closes.
- Restore focus to the `Open source` button.

### Independent library

- Add `Sources` beside `Topics` and `MCQs` in tracker search.
- Search titles, aliases, section headings, keywords, and passage text.
- Rank title/topic matches above section and body-text matches.
- Show subject/topic/section breadcrumbs and a short escaped-text snippet.
- Provide `Browse all sources` from the Sources mode.
- Browse subject → topic → section; reuse the same reader renderer.
- Keep navigation inside the tracker and avoid adding a bottom-nav item.

## Data architecture

Canonical reviewed data belongs under:

```text
content/medical/
  med401-git/
    manifest.json
    topics/
      <topic-id>.json
    evidence/
      mcq-evidence.json
    assets/
      <sha256>.webp
```

Generated deploy data belongs under:

```text
public/data/medical/
  manifest.json
  search-index.json
  topics/
    <topic-id>.json
  assets/
    <sha256>.webp
```

The build must be deterministic: the same source bytes produce the same IDs,
assets, JSON ordering, and integrity report.

### Topic

```json
{
  "id": "med401-git-acute-hepatitis",
  "subjectId": "med401-git",
  "title": "Acute Hepatitis",
  "aliases": [],
  "sectionIds": [
    "med401-git-acute-hepatitis-definition"
  ],
  "sourceVersion": "must401-git-2026-07-27",
  "status": "published"
}
```

### Source section and passage

```json
{
  "id": "med401-git-acute-hepatitis-definition",
  "topicId": "med401-git-acute-hepatitis",
  "title": "Definition",
  "keywords": ["acute hepatitis"],
  "passages": [
    {
      "id": "med401-git-acute-hepatitis-definition-p01",
      "order": 1,
      "pageLabel": "Source page 1",
      "text": "Exact imported source text, preserved without invented claims.",
      "sourceHash": "sha256-of-normalized-passage"
    }
  ]
}
```

### MCQ citation

```json
{
  "questionId": "existing-stable-question-id",
  "topicId": "med401-git-acute-hepatitis",
  "sectionId": "med401-git-acute-hepatitis-definition",
  "passageIds": [
    "med401-git-acute-hepatitis-definition-p01"
  ],
  "sourceVersion": "must401-git-2026-07-27",
  "reviewStatus": "verified",
  "reviewedAt": "2026-07-28"
}
```

### Answer explanation

```json
{
  "questionId": "existing-stable-question-id",
  "correct": {
    "choiceId": "existing-choice-id",
    "text": "Concise rationale supported by the cited passage."
  },
  "incorrect": {
    "selected-choice-id": {
      "text": "Why this choice is wrong, only when the cited source establishes it.",
      "passageIds": [
        "med401-git-acute-hepatitis-definition-p01"
      ]
    }
  }
}
```

## Linking rules

- Link by immutable IDs, never display titles, array indexes, or fuzzy text at
  runtime.
- Keep evidence in a sidecar keyed by the existing MCQ `questionId`; do not
  reshape every MCQ bank.
- Every `verified` or `published` rationale must resolve to an existing topic,
  section, and passage in the same source version.
- The cited passage must directly establish the rationale. Topic proximity is
  insufficient.
- An incorrect-choice rationale is optional. Missing evidence means omit that
  rationale, not infer it.
- Candidate matching may help reviewers find passages but may not publish
  evidence automatically.
- Existing MCQ IDs, answer keys, ordering, and progress-storage keys are
  immutable during this work.

## Component and file architecture

Prefer small plain-JavaScript modules:

```text
scripts/extract-med401-git-source.mjs
scripts/build-medical-library.mjs
scripts/validate-medical-library.mjs

src/knowledgeLibrary.js
public/src/knowledgeLibrary.js

content/medical/...
public/data/medical/...

tests/knowledge.test.mjs
```

`knowledgeLibrary.js` should own:

- Manifest/topic loading with a small in-memory cache.
- Search normalization and result ranking.
- Citation resolution.
- Safe source rendering helpers.
- Source-reader state that is separate from quiz scoring/progress state.

`main.js` should own only integration:

- Sources search-mode routing.
- Opening/closing the reader within the current quiz dialog.
- Rendering the immediate feedback block.
- Focus and scroll restoration.

`style.css` should add the responsive library, feedback, and reader presentation
using existing design tokens and component naming conventions.

Do not add a framework, search service, database, or runtime dependency for
this corpus.

## Extraction and migration workflow

1. Verify the input SHA-256 before extraction.
2. Parse the supplied document’s existing JavaScript data object or equivalent
   structured payload. Do not scrape the visible UI if structured data exists.
3. Convert its 6 existing topics, 37 sections, and 82 source pages to canonical
   JSON without paraphrasing the source text.
4. Extract the 6 data-URI WebP images to SHA-named files and replace data URIs
   with relative asset records.
5. Normalize only representation details: line endings, safe whitespace, field
   names, and deterministic key/order conventions. Preserve meaningful text.
6. Store provenance: input filename, full input hash, extractor version,
   extraction timestamp, counts, and passage hashes.
7. Generate deploy JSON and a compact lexical search index from canonical data.
8. Produce a machine-readable integrity report comparing expected and actual
   topics, sections, passages, images, and unresolved references.
9. Import professor explanations, Arabic explanations, summaries, and
   self-checks only into a clearly non-published candidate artifact if useful.
   They must never appear as authoritative source passages.
10. Candidate MCQ matches require human verification before their
    `reviewStatus` can become `verified`.

No medical information should be copied manually from the supplied HTML into
the JSON files.

## MVP scope

Implement locally:

- Deterministic extraction, build, and validation commands.
- The full supplied GIT corpus as a generated read-only library.
- Subject/topic/section browsing and keyword search.
- Reusable source reader with exact passage deep links and highlighting.
- Quiz feedback/citation runtime support with safe fallback for unlinked MCQs.
- Evidence schema and validation.
- A small set of evidence records only if each rationale can be demonstrated
  as directly source-faithful during review. It is acceptable for the initial
  evidence file to contain no published records; never fill it by guessing.
- Automated tests and mirrored-file checks.

Do not implement yet:

- Supabase content tables or admin CMS.
- Semantic/vector search.
- Bookmarks, confidence, completion, study/revision modes, self-checks, or a
  second progress model.
- A new service worker or offline cache policy.
- Bulk AI-generated medical rationales.
- Changes to the existing `/study/` mini-app.

## Phased implementation order

1. Extraction and provenance: source parser, canonical content, images, and
   integrity report.
2. Static build: manifest, per-topic files, search index, evidence validator.
3. Read-only library: Sources mode, browsing, snippets, and shared reader.
4. Quiz integration: feedback resolver, source action, deep-link/highlight,
   state and focus restoration, legacy fallback.
5. Evidence review: add verified records in small reviewed batches.
6. Later, only if needed: Supabase draft/review/publish workflow that exports
   versioned static snapshots.

## Validation and acceptance criteria

Data integrity:

- Input hash matches the value at the top of this plan.
- Output has exactly 6 topics, 37 sections, 82 source pages, and 6 images.
- Meaningful source text round-trips without loss; every passage has a stable
  hash.
- IDs and slugs are unique and deterministic.
- Every manifest, topic, asset, and evidence reference resolves.
- No data URI remains in runtime JSON.
- Imported HTML is never injected into the DOM.
- A verified rationale cannot exist without a valid passage citation.

Regression safety:

- Existing MCQ IDs, correct answers, quiz source IDs, and progress keys remain
  unchanged.
- Unlinked questions retain their previous explanation behavior.
- Existing topic and MCQ search still work.
- Existing `/study/` files and behavior are unchanged.
- `src/main.js` equals `public/src/main.js`,
  `src/style.css` equals `public/src/style.css`, and
  `src/knowledgeLibrary.js` equals `public/src/knowledgeLibrary.js`.

Interaction and accessibility:

- Opening and closing a source does not reset answer, index, score, timer,
  progress, or quiz scroll.
- The cited passage is scrolled into view and visibly, temporarily highlighted.
- The reader is keyboard reachable, Escape/back behavior is predictable, and
  focus returns to its opener.
- Search results and status changes have appropriate accessible labels/live
  regions.
- At 390 px there is no horizontal overflow or nested-modal trap.
- Desktop split view remains readable and does not obscure quiz controls.
- Reduced-motion preferences are honored.

Required automated gates:

```powershell
npm test
npm run build
Get-FileHash src\main.js,public\src\main.js
Get-FileHash src\style.css,public\src\style.css
Get-FileHash src\knowledgeLibrary.js,public\src\knowledgeLibrary.js
```

Browser verification is deferred until Ahmed explicitly authorizes use of the
already-open in-app browser.

## Risks, tradeoffs, and safeguards

- Local static content is simpler, fast, cacheable, reviewable in Git, and
  works without a content backend. The tradeoff is that editors cannot publish
  through a browser; that is acceptable for the initial corpus.
- Full-text search in the browser is appropriate for 82 passages. Reconsider
  indexing only when corpus size or load measurements justify it.
- Source material may be source-specific or become outdated. Display source
  version/provenance and never silently “correct” original text.
- Lecture text and images may have distribution restrictions. Keep the work
  local until publication rights are confirmed.
- Generated explanations can introduce unsupported medical claims. Require
  exact passage IDs, review states, validation, and safe omission.
- Large changes in `main.js` are risky. Keep integration narrow, module-backed,
  and covered by tests.

## Final recommended approach

Automatically convert the topics already present in the supplied HTML into
versioned local JSON and hashed image files. Add one lightweight Sources mode
and one reusable in-dialog reader. Connect MCQs through a separate, reviewed
evidence file keyed by stable question IDs. Keep Supabase out of source-content
delivery for now, retain the existing quiz as the primary experience, and show
source-backed rationales only when the exact supporting passage has been
verified.

## Antigravity implementation brief

<task>
Implement the local MVP described in this plan on the current feature branch.
The result must include the deterministic source conversion, generated library,
Sources search/browse experience, in-quiz source reader, evidence schema/runtime
support, validation tests, and safe fallback behavior.
</task>

<context>
The source HTML is outside the repository at the absolute path and hash stated
above. Its topic structure is already present; convert it rather than manually
re-entering content. The application is plain Vite/JavaScript. Preserve all
existing quiz IDs, answer keys, and progress behavior. Preserve and do not
modify the separate public/study mini-app. Keep all src/public mirrors synced.
</context>

<constraints>
- Work only in this feature worktree. Do not push, deploy, or write Supabase.
- Do not add dependencies unless the existing platform cannot implement a
  requirement; explain any unavoidable addition before making it.
- Do not invent, expand, or silently correct medical content.
- Do not publish guessed MCQ citations or AI-generated medical rationales.
- Never render imported raw HTML; use escaped text and vetted structured fields.
- Do not change existing MCQ IDs, correct choices, source IDs, or progress keys.
- Do not use a nested modal and do not create a new bottom navigation item.
- Do not modify public/study.
- Browser testing is not authorized in this run.
</constraints>

<implementation>
Follow the phased order above. Add focused modules and tests instead of
expanding main.js unnecessarily. The extraction command must operate from the
external source path, verify its hash, and write deterministic canonical and
generated outputs. Commit generated deploy data required by the static site.
Ensure the site remains usable when library data fails to load and when an MCQ
has no evidence record.
</implementation>

<acceptance>
All acceptance criteria and automated gates in this plan must pass. Also inspect
the final git diff for accidental medical text changes, changes under
public/study, ID/key changes, raw innerHTML injection of imported content, and
unsynchronized mirrors. Return a concise summary of changed files, decisions,
test results, and any deliberately incomplete evidence mapping.
</acceptance>
