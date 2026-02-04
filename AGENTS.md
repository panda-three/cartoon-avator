# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router entrypoints (`app/layout.tsx`, `app/page.tsx`) and global styles (`app/globals.css`).
- `components/`: Section-level React components used by pages (e.g. `components/hero.tsx`).
- `components/ui/`: Reusable UI primitives (shadcn-style) consumed across the app.
- `hooks/`: Shared hooks used outside the UI layer.
- `lib/`: Utilities (see `lib/utils.ts` for `cn()` Tailwind class merging).
- `public/`: Static assets served at `/` (e.g. `public/icon.svg`).

## Build, Test, and Development Commands
This repo uses `npm` (see `package-lock.json`):
- `npm install`: Install dependencies.
- `npm run dev`: Run the local dev server.
- `npm run build`: Build the production bundle.
- `npm run start`: Serve the production build.
- `npm run lint`: Run ESLint across the repository.

## Coding Style & Naming Conventions
- TypeScript + React (`.ts`/`.tsx`); strict type-checking is enabled in `tsconfig.json`.
- Indentation: 2 spaces; follow existing formatting (no semicolons in most files).
- Filenames: kebab-case for components (`components/video-generator.tsx`); hooks use `use-*.ts`.
- Imports: prefer path aliases (`@/components/...`, `@/lib/...`) over deep relative paths.
- Styling: Tailwind CSS is configured via PostCSS (`postcss.config.mjs`) and global tokens live in `app/globals.css`. Use `cn()` when composing `className`.

## Testing Guidelines
- No test runner is configured yet. Validate changes by running `npm run dev` and exercising affected routes/components.
- If you add tests, use `*.test.ts(x)` naming and place them near the unit under test or in a top-level `tests/` folder.

## Commit & Pull Request Guidelines
- This workspace does not include Git history; default to Conventional Commits (e.g. `feat: add generator validation`, `fix: handle empty upload`).
- PRs should include: a clear summary, steps to verify, and screenshots/GIFs for UI changes.

## Security & Configuration Tips
- Keep secrets in `.env.local` (all `.env*` files are gitignored). Only expose browser-safe values via `NEXT_PUBLIC_*`.

## Agent-Specific Instructions
- Keep diffs focused; avoid dependency upgrades or large refactors unless requested.
- Prefer `rg` for searching and update UI components in `components/ui/` in the existing shadcn patterns.
