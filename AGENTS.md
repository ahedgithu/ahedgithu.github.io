# Website Repository Instructions

## Scope and Structure

- Production repo: `E:\website\app`. `E:\website` is only the parent folder.
- This is a Vite static MED 401/402 website. Root HTML files are page entry
  points; application code and MCQ banks live in `src/`; deploy-served copies
  and static assets live in `public/`.
- Any file edited under `src/` that has the same relative path under
  `public/src/` is a mirror pair. Keep the pair byte-identical.
- `dist/` and `graphify-out/` are generated outputs. Do not edit them by hand,
  include them in a release, or treat an untracked `graphify-out/` as user work.
- Follow the existing plain JavaScript, semantic HTML, two-space indentation,
  descriptive `camelCase`, and component-style CSS naming. Avoid unrelated
  refactors and never expose private study progress in public content.

## Fast Session Start

Do not load Obsidian and Graphify automatically. Start with only:

1. Confirm the task is for `E:\website\app`.
2. Run `git status --short --branch`.
3. Inspect the files or rendered behavior directly named by Ahmed.
4. Choose one context route below.

For local website testing, port `5173` is the only allowed Vite port. Never pass
`--port 5174` or any other override. Before starting Vite, inspect the process
already listening on `5173`. It must be serving `E:\website\app`; otherwise stop
it and restart `5173` from `E:\website\app`. Do not start a second website server
on a fallback port.

If the worktree is dirty, inspect changes that overlap the requested files
before editing. Preserve unrelated user changes. Do not repeatedly inventory or
explain known generated `graphify-out/` files unless they affect the task.

## Single Checkout Rule

- `E:\website\app` is the only allowed working checkout for this repository.
- Do not create or use Git worktrees for feature work, testing, recovery, or
  releases unless Ahmed explicitly reverses this rule for a specific task.
- Local Vite testing on port `5173` must always run from `E:\website\app`.
- Branches may be used inside this checkout, but preserve dirty work on a local
  recovery branch or scoped commit before switching branches.
- When a release is requested from a dirty checkout, stop and reconcile the
  intended release inside `E:\website\app`; do not silently create a clean
  release worktree.
- A handoff that names another checkout is historical only and must not override
  this rule.

## Context Routing: Obsidian vs Graphify

### Obsidian only

Use `Agent-Codex` when the task depends on prior decisions, a saved handoff,
historical live/local state, an earlier plan, Ahmed asks to resume/save/`ss`, or
the current request is ambiguous in a way history can resolve.

- Read `C:\Users\ahmed\ObsidianVault\Agent-Codex\working-context.md` first.
- Read only the handoff or task note it points to that is relevant now.
- Read `00-start-here.md` only when vault routing, source locations, or general
  operating rules are actually needed. Never read every handoff at startup.
- Use the ASCII-safe junction path above. If it is missing, report that context
  could not be loaded; do not rename OneDrive folders or recreate the junction
  unless Ahmed asks.

### Graphify only

Use Graphify for cross-file architecture, dependency/impact analysis, tracing
how a feature works, locating an unfamiliar implementation, or an explicit
`/graphify` request.

- If `graphify-out/graph.json` exists, begin with a scoped
  `graphify query "<question>"`; use `path` or `explain` only when narrower.
- Prefer direct source inspection or `rg` for an exact file, symbol, string,
  small bug, copy change, or known MCQ destination.
- Use `graphify-out/wiki/index.md` for broad navigation when present. Read
  `GRAPH_REPORT.md` only for a broad architecture review or failed scoped query.

### Both

Use both only when a historical decision or handoff must be reconciled with
current cross-file architecture, such as a complex resume, major audit,
recovery/merge plan, or release that combines saved work from several branches.
Read the relevant Obsidian pointer first, then ask Graphify a scoped question.

### Neither

Use neither for simple questions, status reads, direct edits with known files,
small copy/style fixes, or source-supplied MCQ work whose destination is already
clear. Repository state and focused source inspection are enough.

### Updating Graphify

Run `graphify update .` after meaningful structural JavaScript/module changes
or when Ahmed explicitly asks for an updated graph. Skip it for instructions,
handoffs, pure HTML/CSS/copy/assets, and data-only MCQ-bank changes. A Graphify
version mismatch or zero-node data-file warning is non-blocking unless the task
is about graph health.

## Task and Skill Routing

Use only the smallest relevant skill set:

- `add-mcqs`: adding or replacing MCQs from supplied text, PDF, image, Markdown,
  or JSON. Preserve source fidelity, existing source separation, generators,
  cache keys, and all mirror pairs. Do not invoke it for ordinary tracker UI.
- `supabase`: any Supabase, auth/session, RLS, database, Storage, Realtime, RPC,
  migration, or live-data task. Read current Supabase docs, protect secrets and
  user data, verify the result, and distinguish local code from live writes.
- `frontend-design`: a new interface or substantial visual redesign. Do not run
  it for a narrow bug fix, copy change, or existing-style polish.
- `web-design-guidelines`: an explicit UX, accessibility, or design audit. It
  is review guidance, not an automatic implementation or every-UI-change gate.
- `browser`: only when Ahmed asks for browser testing and confirms use of the
  already-open Codex in-app browser. Do not use Chrome, Edge, or another browser
  unless he explicitly asks.
- `find-skills` / `skill-installer`: only when Ahmed asks to find/install a
  capability or a repeated specialized task is genuinely unsupported. Review
  provenance and warnings; do not install skills during routine website work.
- `agy-delegate`: only when Ahmed explicitly asks to use Antigravity/`agy`.
- `prompt-enhancer`: when Ahmed asks to improve a prompt. If his message starts
  with `EP`, return only the improved prompt and do not execute it.
- `Sites`: do not use for this GitHub Pages repo while
  `.openai/hosting.json` is absent. Use it only after an explicit hosting
  migration or when that marker exists.
- Document, PDF, spreadsheet, presentation, image-generation, medical-study,
  creative-app, YouTube, OpenMontage, visualization, template, OpenAI-docs, and
  plugin-creation skills are not automatic website tools. Use them only when
  the requested deliverable directly matches their stated purpose.

`Notion` is required only when Ahmed says `NT`, `notion task`, or asks for
`Website Improvement Tasks`. Read that database before planning and reconcile
it with the repo. If the Notion connector is unavailable, say so instead of
silently substituting stale notes or browser scraping. Google Drive lookup is
similarly conditional; for MCQs prefer the local `E:\external\DRIVE MCQS`
archive unless Ahmed asks for live Drive comparison.

MemPalace is not part of the default workflow. Do not install, initialize, mine,
or add auto-save hooks without Ahmed's explicit request. If later piloted, use
it only as optional semantic search over raw transcripts; it complements rather
than replaces curated Obsidian decisions or Graphify's code map.

## Editing and Validation

- Make the smallest safe change and keep every edited `src/` / `public/src/`
  mirror synchronized.
- Run relevant generator scripts when a generated MCQ/source bank is involved.
- For code, UI, behavior, or MCQ changes, run `npm test` and `npm run build`.
- For instruction/documentation-only changes, run `git diff --check` and a
  focused contradiction/duplication review; do not run the application build.
- Hash-check only the mirror pairs touched by the task.
- Browser QA is additional, not automatic; use it only under the browser rule
  above. When requested, check affected mobile and desktop states for overflow,
  overlap, navigation, and interaction regressions.
- Do not run dependency upgrades, audit fixes, broad formatting, or unrelated
  cleanup as incidental validation.

## Git and Release Discipline

- `main` is the GitHub Pages live branch. Local files are not live until a
  requested push succeeds and deployment is verified.
- Do not commit, push, deploy, publish, or write to live Supabase unless Ahmed's
  request clearly authorizes that action.
- Before an authorized release, fetch current `origin/main`, run the full
  relevant validation, and state exactly what will ship. If the checkout is
  dirty, behind, or contains unrelated work, preserve that work on a local
  recovery branch or scoped commit, return to current `main`, and prepare the
  release in `E:\website\app`.
- Keep commits scoped with short imperative summaries. Verify the GitHub Pages
  run and live HTTP behavior only after an authorized push.
- Final responses after website changes must include the relevant local or live
  page link and state clearly whether the result is local-only or live.

## Continuity

Before the final response for meaningful completed work, save continuity to
`Agent-Codex` without waiting for `ss`. Meaningful work includes repository or
configuration edits, external-system writes, commits/releases, major audits or
decision-complete plans, and substantial blocked investigations with reusable
findings.

Create one dated note under `Agent-Codex/handoffs/`, then make it the first
resume pointer in `working-context.md`. Record the actual branch/worktree and
dirty state, completed work, validation, remaining issues, and whether anything
was committed, pushed, deployed, or changed live. Do not save secrets, private
study information, simple questions, status reads, tiny checks, or casual
conversation.
