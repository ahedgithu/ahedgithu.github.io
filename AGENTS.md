# Repository Guidelines

## Project Structure & Module Organization

This is a Vite-powered static MED 401 website. Top-level pages live at the repo root: `index.html`, `news.html`, `schedule.html`, `history.html`, and `work.html`. Main application code is in `src/`: `main.js`, `style.css`, `mcqs.js`, and `analytics.js`. The `public/` folder contains deploy-served static files, PWA files, icons, and mirrored copies under `public/src/`. Keep `src/` and `public/src/` mirrors synced when editing shared JS, CSS, MCQs, or analytics code. Built output goes to `dist/` and should not be edited by hand.

## Build, Test, and Development Commands

- `npm run dev` starts the local Vite server, usually at `http://127.0.0.1:5173/`.
- `npm test` runs the lightweight source, progress, Supabase safety, and deployment checks.
- `npm run build` creates the production build in `dist/`; run this before any public push.
- `npm run preview` serves the production build locally for final checks.

Run `npm test` and `npm run build` for routine validation. Run browser verification only when Ahmed asks for testing and confirms using the in-app browser.

## Coding Style & Naming Conventions

Use plain JavaScript modules, semantic HTML, and CSS in the existing style. Keep indentation at two spaces in JS/CSS/HTML. Prefer descriptive `camelCase` for JS variables and functions. CSS uses component-style class names such as `schedule-calendar__frame`, `quiz-action--primary`, and `exam-card--quiz`; follow that pattern. Avoid unrelated refactors and avoid private study progress in public-facing content.

## Testing Guidelines

For UI changes, run `npm run build` and verify the affected page in the local browser. Check mobile and desktop widths for overflow, overlapping text, and broken navigation. For mirrored files, confirm hashes match, for example:

```powershell
Get-FileHash src\main.js,public\src\main.js,src\style.css,public\src\style.css
```

## Commit & Pull Request Guidelines

Recent commits use short imperative summaries, for example `Refine calm clinical design and nav` or `Add NUT vitamins MCQs`. Keep commits scoped and explain user-visible changes in the PR description. Include screenshots for visual changes, note build results, and call out whether changes affect `main`, a feature branch, or local-only draft work.

## Agent-Specific Instructions

Production repo is `E:\website\app`; `E:\website` is only the parent folder. At the start of every website session, read the Obsidian `Agent-Codex` context first through the ASCII-safe vault alias:

- `C:\Users\ahmed\ObsidianVault\Agent-Codex\00-start-here.md`
- `C:\Users\ahmed\ObsidianVault\Agent-Codex\working-context.md`

`C:\Users\ahmed\ObsidianVault` is a Windows junction to the real OneDrive Obsidian vault. Use this alias instead of typing the localized OneDrive Documents folder path, because some terminals render that folder name incorrectly. Do not rename the real OneDrive Documents folder. If the alias is missing, recreate it as a junction to the real `Obsidian Vault` folder under OneDrive Documents, then continue using the alias.

Start website edits by checking branch and `git status`. GitHub Pages deploys from `main` only. Do not push or deploy unless Ahmed explicitly asks. If the worktree is dirty, inspect and explain the dirty files before editing. For narrow live pushes from a dirty repo, use a clean temporary worktree from `origin/main`.

When Ahmed says `NT`, `notion task`, or asks to check website improvement tasks, directly inspect the Notion `Website Improvement Tasks` database before planning or editing. Use the Notion task rows as the active source of truth for website improvement priorities, then reconcile them with the current repo state.

For browser verification, test only when Ahmed asks for testing and confirms using Codex's in-app browser that he already has open. Do not use the installed Chrome, Edge, or other machine browsers unless Ahmed explicitly asks for that.

Whenever local website changes are completed, include the relevant page link at the end of the final response and clearly state whether the changes are local-only or live.

Before the final response for a meaningful completed task, automatically save session continuity to `Agent-Codex` without waiting for Ahmed to type `ss`. A meaningful task includes repository or configuration edits, Supabase or other external-system writes, commits/pushes/deployments, major completed audits or decision-complete plans, and substantial blocked work with reusable findings. Create a dated handoff under `Agent-Codex/handoffs/`, then update `Agent-Codex/working-context.md` so that handoff is the first resume pointer. Record the branch and dirty state, completed work, validation, remaining issues, and whether anything was pushed, deployed, or changed live. Do not auto-save simple questions, status reads, tiny checks, casual conversation, secrets, or private study information.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
