# Repository Guidelines

## Project Structure & Module Organization

This is a Vite-powered static MED 401 website. Top-level pages live at the repo root: `index.html`, `news.html`, `schedule.html`, `history.html`, and `work.html`. Main application code is in `src/`: `main.js`, `style.css`, `mcqs.js`, and `analytics.js`. The `public/` folder contains deploy-served static files, PWA files, icons, and mirrored copies under `public/src/`. Keep `src/` and `public/src/` mirrors synced when editing shared JS, CSS, MCQs, or analytics code. Built output goes to `dist/` and should not be edited by hand.

## Build, Test, and Development Commands

- `npm run dev` starts the local Vite server, usually at `http://127.0.0.1:5173/`.
- `npm run build` creates the production build in `dist/`; run this before any public push.
- `npm run preview` serves the production build locally for final checks.

There is no dedicated test script in `package.json`; use build plus browser verification for changes.

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

Production repo is `E:\website\app`; `E:\website` is only the parent folder. Start website edits by checking branch and `git status`. GitHub Pages deploys from `main` only. Do not push or deploy unless Ahmed explicitly asks. If the worktree is dirty, inspect and explain the dirty files before editing. For narrow live pushes from a dirty repo, use a clean temporary worktree from `origin/main`.
